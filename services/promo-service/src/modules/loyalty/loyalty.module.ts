import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyConsumer } from './loyalty.consumer';

@Module({
  controllers: [LoyaltyController],
  providers: [
    LoyaltyService,
    LoyaltyConsumer,
    {
      provide: 'DB_POOL',
      useFactory: () => {
        return new Pool({
          host: process.env.POSTGRES_HOST || 'localhost',
          port: parseInt(process.env.POSTGRES_PORT || '5432'),
          user: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'postgres',
          database: 'scango_promo',
          max: 10,
        });
      },
    },
  ],
})
export class LoyaltyModule {}
