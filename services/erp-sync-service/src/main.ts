import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3021);
  console.log(`ERP Sync Service is running on: ${await app.getUrl()}`);
}
bootstrap();
