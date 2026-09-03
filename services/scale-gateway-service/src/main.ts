import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(helmet());

  const port = process.env.PORT || 3016;
  await app.listen(port);
  console.log(`Scale Gateway Service listening on port ${port}`);
}
bootstrap();
