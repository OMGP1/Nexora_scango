import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  await app.listen(3018);
  console.log(`Risk Engine Service is running on: ${await app.getUrl()}`);
}
bootstrap();
