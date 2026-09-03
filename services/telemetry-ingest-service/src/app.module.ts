import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TelemetryModule } from './modules/telemetry/telemetry.module';

@Module({
  imports: [TelemetryModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
