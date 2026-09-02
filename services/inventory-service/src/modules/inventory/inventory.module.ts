import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { ScheduleModule } from '@nestjs/schedule';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryConsumer } from './inventory.consumer';
import { ErpAdapter } from './erp.adapter';
import { ReconciliationJob } from '../../jobs/reconciliation.job';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    InventoryConsumer,
    ErpAdapter,
    ReconciliationJob,
    {
      provide: 'DB_POOL',
      useFactory: () => {
        return new Pool({
          host: process.env.POSTGRES_HOST || 'localhost',
          port: parseInt(process.env.POSTGRES_PORT || '5432'),
          user: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'postgres',
          database: 'scango_inventory',
          max: 10,
        });
      },
    },
  ],
})
export class InventoryModule {}
