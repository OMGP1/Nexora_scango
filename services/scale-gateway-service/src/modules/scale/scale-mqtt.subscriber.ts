import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { ScaleService, ScaleReading } from './scale.service';

@Injectable()
export class ScaleMqttSubscriber implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private readonly logger = new Logger(ScaleMqttSubscriber.name);

  constructor(private readonly scaleService: ScaleService) {}

  onModuleInit() {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    this.logger.log(`Connecting to MQTT broker at ${brokerUrl}`);
    
    this.client = mqtt.connect(brokerUrl, {
      will: {
        topic: 'gateway/scale/status',
        payload: Buffer.from(JSON.stringify({ status: 'offline' })),
        qos: 1,
        retain: true,
      },
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
      this.client.publish('gateway/scale/status', JSON.stringify({ status: 'online' }), { qos: 1, retain: true });
      this.client.subscribe('store/+/scale/reading', (err) => {
        if (err) {
          this.logger.error('Failed to subscribe to topic', err);
        } else {
          this.logger.log('Subscribed to store/+/scale/reading');
        }
      });
    });

    this.client.on('message', async (topic, message) => {
      try {
        const payload = JSON.parse(message.toString()) as ScaleReading;
        if (!payload.store_id || !payload.lane_code) {
          this.logger.warn(`Invalid payload on topic ${topic}`);
          return;
        }
        await this.scaleService.storeReading(payload.store_id, payload.lane_code, payload);
      } catch (e) {
        this.logger.error(`Error processing message from topic ${topic}`, e);
      }
    });

    this.client.on('error', (err) => {
      this.logger.error('MQTT Client Error', err);
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.logger.log('Disconnecting from MQTT broker');
      this.client.end();
    }
  }
}
