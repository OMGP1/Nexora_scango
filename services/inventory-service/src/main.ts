import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createLogger } from '@scango/common';

const logger = createLogger('inventory-service');
const PORT = process.env.PORT || 3005;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(PORT);
  logger.info({ port: PORT }, 'inventory-service is running');
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start inventory-service');
  process.exit(1);
});
