import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { PromoController } from './promo.controller';
import { PromoService } from './promo.service';

@Module({
  controllers: [PromoController],
  providers: [
    PromoService,
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
export class PromoModule {}
