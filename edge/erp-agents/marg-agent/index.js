require('dotenv').config();
const { Kafka } = require('kafkajs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'marg-agent';
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'marg-agent-group';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'marg_bridge.db');
const TOPIC = 'erp.sync.v1';

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
});

const consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID });
const producer = kafka.producer();

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error(`Error opening database ${DB_PATH}:`, err.message);
  } else {
    console.log(`Connected to local SQLite database at ${DB_PATH}`);
    db.run(`CREATE TABLE IF NOT EXISTS sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sql_statement TEXT,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

async function run() {
  await consumer.connect();
  await producer.connect();
  console.log(`Connected to Kafka brokers: ${KAFKA_BROKERS}`);

  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
  console.log(`Subscribed to topic: ${TOPIC}`);

  // Heartbeat loop
  setInterval(async () => {
    try {
      await producer.send({
        topic: 'edge.agent.heartbeat',
        messages: [
          {
            value: JSON.stringify({
              agent: 'marg-agent',
              timestamp: new Date().toISOString(),
              status: 'healthy',
            }),
          },
        ],
      });
      console.log('Heartbeat sent.');
    } catch (err) {
      console.error('Failed to send heartbeat:', err);
    }
  }, 30000);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const payloadStr = message.value.toString();
        const payload = JSON.parse(payloadStr);

        if (payload.target === 'marg') {
          console.log(`Processing Marg payload...`);
          const sqlStatement = payload.sqlPayload || payload.data;
          
          if (!sqlStatement) {
            console.error('Missing SQL payload for Marg.');
            return;
          }

          db.exec(sqlStatement, (err) => {
            if (err) {
              console.error('Error executing SQL statement in Marg DB:', err.message);
            } else {
              console.log('Successfully executed SQL statement in Marg DB.');
              // Log the successful execution
              db.run(`INSERT INTO sync_logs (sql_statement) VALUES (?)`, [sqlStatement], (logErr) => {
                  if (logErr) {
                      console.error('Error logging SQL execution:', logErr.message);
                  }
              });
            }
          });
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
    },
  });
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
