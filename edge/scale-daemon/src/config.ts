import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

export const config = {
  SCALE_SERIAL_PORT: process.env.SCALE_SERIAL_PORT || (process.platform === 'win32' ? 'COM3' : '/dev/ttyUSB0'),
  STORE_ID: requireEnv('STORE_ID'),
  LANE_CODE: requireEnv('LANE_CODE'),
  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  DEBOUNCE_INTERVAL_MS: parseInt(process.env.DEBOUNCE_INTERVAL_MS || '500', 10),
  BAUD_RATE: parseInt(process.env.BAUD_RATE || '9600', 10),
};
