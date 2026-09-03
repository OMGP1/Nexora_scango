import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { createPool } from '@scango/db';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [HttpModule],
  controllers: [CartController],
  providers: [
    CartService,
    {
      provide: 'DB_POOL',
      useFactory: () => {
        return createPool({
          host: process.env.POSTGRES_HOST || 'localhost',
          port: parseInt(process.env.POSTGRES_PORT || '5432'),
          user: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'postgres',
          database: 'scango_cart',
          max: 10,
        });
      },
    },
  ],
})
export class CartModule {}
