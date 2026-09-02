import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  const port = process.env.PORT || 3008;
  await app.listen(port);
  
  Logger.log(`Audit & Analytics Service running on port ${port}`, 'Bootstrap');
}
bootstrap();
