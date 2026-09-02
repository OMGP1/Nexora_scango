import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { PaymentModule } from './modules/payment/payment.module';
import { PaymentIntent } from './modules/payment/payment-intent.entity';
import { HealthController } from './health.controller';

@Module({
  imports: [
    PrometheusModule.register(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/scango_payment',
      entities: [PaymentIntent],
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
