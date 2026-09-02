import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  imports: [
    PrometheusModule.register(),],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
