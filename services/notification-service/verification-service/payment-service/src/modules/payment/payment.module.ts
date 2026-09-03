import { Module } from '@nestjs/common';
import { createPool } from '@scango/db';
import { HttpModule } from '@nestjs/axios';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeAdapter } from './adapters/stripe.adapter';
import { ExitPassService } from './exit-pass.service';

@Module({
  imports: [HttpModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    StripeAdapter,
    ExitPassService,
    {
      provide: 'DB_POOL',
      useFactory: () => {
        return createPool({
          host: process.env.POSTGRES_HOST || 'localhost',
          port: parseInt(process.env.POSTGRES_PORT || '5432'),
          user: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'postgres',
          database: 'scango_payment',
          max: 10,
        });
      },
    },
  ],
})
export class PaymentModule {}
