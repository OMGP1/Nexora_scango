import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
