import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createLogger } from '@scango/common';

const logger = createLogger('analytics-service');
const PORT = process.env.PORT || 3011;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(PORT, '0.0.0.0');
  logger.info({ port: PORT }, 'analytics-service is running');
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start analytics-service');
  process.exit(1);
});
