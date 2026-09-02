import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [
    PrometheusModule.register(),InventoryModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
