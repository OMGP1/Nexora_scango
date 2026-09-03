import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createLogger } from '@scango/common';
import helmet from 'helmet';

const logger = createLogger('payment-service');
const PORT = process.env.PORT || 3007;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  await app.listen(PORT, '0.0.0.0');
  logger.info({ port: PORT }, 'payment-service is running');
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start payment-service');
  process.exit(1);
});
