require('dotenv').config();
const { Kafka } = require('kafkajs');
const axios = require('axios');

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'tally-agent';
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'tally-agent-group';
const TALLY_URL = process.env.TALLY_URL || 'http://localhost:9000';
const TOPIC = 'erp.sync.v1';

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
});

const consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID });
const producer = kafka.producer();

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
              agent: 'tally-agent',
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

        if (payload.target === 'tally') {
          console.log(`Processing Tally payload...`);
          const xmlData = payload.xmlPayload || payload.data;
          
          if (!xmlData) {
              console.error('Missing XML payload for Tally.');
              return;
          }
          
          try {
            const response = await axios.post(TALLY_URL, xmlData, {
              headers: {
                'Content-Type': 'application/xml',
              },
            });
            console.log(`Successfully synced to Tally. Status: ${response.status}`);
          } catch (apiErr) {
            console.error(`Failed to sync to Tally: ${apiErr.message}`);
          }
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
