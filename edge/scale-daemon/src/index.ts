import * as mqtt from 'mqtt';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { config } from './config';

const STATUS_TOPIC = `store/${config.STORE_ID}/scale/status`;
const READING_TOPIC = `store/${config.STORE_ID}/scale/reading`;
const CLIENT_ID = `scale-${config.STORE_ID}-${config.LANE_CODE}`;

// Connect to MQTT broker with LWT
const mqttClient = mqtt.connect(config.MQTT_BROKER_URL, {
  clientId: CLIENT_ID,
  will: {
    topic: STATUS_TOPIC,
    payload: Buffer.from('OFFLINE'),
    qos: 1,
    retain: true,
  },
});

mqttClient.on('connect', () => {
  console.log(`[MQTT] Connected to ${config.MQTT_BROKER_URL}`);
  mqttClient.publish(STATUS_TOPIC, 'ONLINE', { qos: 1, retain: true });
});

mqttClient.on('error', (err) => {
  console.error(`[MQTT] Error:`, err);
});

// Serial Port setup
const port = new SerialPort({
  path: config.SCALE_SERIAL_PORT,
  baudRate: config.BAUD_RATE,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

port.on('open', () => {
  console.log(`[Serial] Opened port ${config.SCALE_SERIAL_PORT} at ${config.BAUD_RATE} baud`);
});

port.on('error', (err) => {
  console.error(`[Serial] Error:`, err);
});

const MAX_READINGS = 5;
const lastReadings: number[] = [];

// Parse line, looking for something that represents weight in grams
// Example formats: '1234g', '1234.5 g', 'ST,GS, 1.234 kg'
function parseWeightLine(line: string): number | null {
  const str = line.trim().toLowerCase();
  
  // Basic regex to find a number followed optionally by space and unit (g, kg)
  const regex = /(-?\d+(?:\.\d+)?)\s*(kg|g)/i;
  const match = str.match(regex);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  if (isNaN(value)) return null;

  // Convert kg to grams
  if (unit === 'kg') {
    return value * 1000;
  }
  return value; // already in grams
}

function calculateStability(readings: number[]): boolean {
  if (readings.length < MAX_READINGS) return false;
  
  const mean = readings.reduce((sum, val) => sum + val, 0) / readings.length;
  
  const squaredDiffs = readings.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / readings.length;
  const stddev = Math.sqrt(variance);

  // Consider stable if standard deviation is less than 5g
  return stddev < 5;
}

let lastPublishTime = 0;

parser.on('data', (line: string) => {
  const weightInGrams = parseWeightLine(line);
  
  if (weightInGrams === null) {
    // Could not parse weight from this line
    return;
  }

  // Update rolling buffer
  if (lastReadings.length >= MAX_READINGS) {
    lastReadings.shift();
  }
  lastReadings.push(weightInGrams);

  const stable = calculateStability(lastReadings);
  const now = Date.now();

  // Rate limit publishing
  if (now - lastPublishTime >= config.DEBOUNCE_INTERVAL_MS) {
    lastPublishTime = now;

    const payload = {
      store_id: config.STORE_ID,
      lane_code: config.LANE_CODE,
      gross_weight_g: weightInGrams,
      reading_ts: new Date().toISOString(),
      stable,
    };

    mqttClient.publish(READING_TOPIC, JSON.stringify(payload), { qos: 1 }, (err) => {
      if (err) {
        console.error(`[MQTT] Publish error:`, err);
      }
    });
  }
});

// Graceful shutdown
function shutdown() {
  console.log('\n[System] Shutting down gracefully...');
  
  mqttClient.publish(STATUS_TOPIC, 'OFFLINE', { qos: 1, retain: true }, () => {
    mqttClient.end(false, () => {
      if (port.isOpen) {
        port.close(() => {
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
