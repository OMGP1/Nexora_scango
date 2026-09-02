import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createLogger } from '@scango/common';

const logger = createLogger('catalog-service');
const PORT = process.env.PORT || 3003;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(PORT);
  logger.info({ port: PORT }, 'catalog-service is running');
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start catalog-service');
  process.exit(1);
});
