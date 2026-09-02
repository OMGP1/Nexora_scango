import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Module } from '@nestjs/common';
import { CartModule } from './modules/cart/cart.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './health.controller';

@Module({
  imports: [
    PrometheusModule.register(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    CartModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
