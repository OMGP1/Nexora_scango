import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createLogger } from '@scango/common';

const logger = createLogger('identity-service');
const PORT = process.env.PORT || 3001;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(PORT, '0.0.0.0');
  logger.info({ port: PORT }, 'identity-service is running');
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start identity-service');
  process.exit(1);
});
