import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createLogger } from '@scango/common';
import helmet from 'helmet';

const logger = createLogger('verification-service');
const PORT = process.env.PORT || 3006;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  await app.listen(PORT);
  logger.info({ port: PORT }, 'verification-service is running');
}
bootstrap();
