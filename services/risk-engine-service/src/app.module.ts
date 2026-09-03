import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { RiskModule } from './modules/risk/risk.module';

@Module({
  imports: [RiskModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
