import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { PaymentModule } from './modules/payment/payment.module';

import { HealthController } from './health.controller';

@Module({
  imports: [
    PrometheusModule.register(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgres://scango:scango_dev_pass@localhost:5434/scango_payments',
      entities: [],
      synchronize: true, // DEV ONLY
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PaymentModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}


