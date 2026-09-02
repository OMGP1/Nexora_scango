import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PromoModule } from './modules/promo/promo.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';

@Module({
  imports: [
    PrometheusModule.register(),PromoModule, LoyaltyModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
