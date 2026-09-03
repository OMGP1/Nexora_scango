// =====================================================
// @scango/kafka — Kafka Producer/Consumer Wrappers
// =====================================================

import { Kafka, Producer, Consumer, EachMessagePayload, logLevel } from 'kafkajs';
import { createLogger, Logger, generateId, BaseKafkaEvent, KafkaTopic } from '@scango/common';

const logger: Logger = createLogger('scango-kafka');

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId?: string;
}

/**
 * Create a Kafka client instance
 */
export function createKafkaClient(config: KafkaConfig): Kafka {
  const saslConfig = process.env.KAFKA_USERNAME && process.env.KAFKA_PASSWORD ? {
    mechanism: 'plain' as const,
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  } : undefined;

  return new Kafka({
    clientId: config.clientId,
    brokers: config.brokers,
    logLevel: logLevel.WARN,
    ssl: !!saslConfig,
    ...(saslConfig && { sasl: saslConfig }),
    retry: {
      initialRetryTime: 300,
      retries: 8,
    },
  });
}

// ── Producer ───────────────────────────────────────

let producerInstance: Producer | null = null;

/**
 * Create and connect a Kafka producer (singleton per process)
 */
export async function createProducer(kafka: Kafka): Promise<Producer> {
  if (producerInstance) return producerInstance;

  const producer = kafka.producer({
    allowAutoTopicCreation: true,
    transactionTimeout: 30000,
  });

  await producer.connect();
  logger.info('Kafka producer connected');

  producerInstance = producer;
  return producer;
}

/**
 * Publish a typed event to a Kafka topic
 */
export async function publishEvent<T extends BaseKafkaEvent>(
  producer: Producer,
  topic: KafkaTopic,
  event: Omit<T, 'event_id' | 'timestamp'> & Partial<Pick<T, 'event_id' | 'timestamp'>>,
): Promise<void> {
  const fullEvent = {
    event_id: generateId(),
    timestamp: new Date().toISOString(),
    ...event,
  };

  await producer.send({
    topic,
    messages: [
      {
        key: fullEvent.session_id,
        value: JSON.stringify(fullEvent),
        headers: {
          event_type: topic,
          event_id: fullEvent.event_id,
        },
      },
    ],
  });

  logger.debug({ topic, event_id: fullEvent.event_id, session_id: fullEvent.session_id }, 'Event published');
}

// ── Consumer ───────────────────────────────────────

export type MessageHandler = (payload: {
  topic: string;
  event: BaseKafkaEvent;
  raw: EachMessagePayload;
}) => Promise<void>;

/**
 * Create and connect a Kafka consumer
 */
export async function createConsumer(
  kafka: Kafka,
  groupId: string,
  topics: string[],
  handler: MessageHandler,
): Promise<Consumer> {
  const consumer = kafka.consumer({
    groupId,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
  });

  await consumer.connect();
  logger.info({ groupId }, 'Kafka consumer connected');

  await consumer.subscribe({
    topics,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async (payload: EachMessagePayload) => {
      const { topic, message } = payload;
      try {
        const event = JSON.parse(message.value?.toString() || '{}') as BaseKafkaEvent;
        logger.debug({ topic, event_id: event.event_id }, 'Message received');
        await handler({ topic, event, raw: payload });
      } catch (err) {
        logger.error({ err, topic, offset: message.offset }, 'Error processing message');
      }
    },
  });

  return consumer;
}

/**
 * Graceful shutdown for producer/consumer
 */
export async function disconnectKafka(producer?: Producer, consumer?: Consumer): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producerInstance = null;
    logger.info('Kafka producer disconnected');
  }
  if (consumer) {
    await consumer.disconnect();
    logger.info('Kafka consumer disconnected');
  }
}

// Re-export kafkajs types
export { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
