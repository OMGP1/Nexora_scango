import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { ErpModule } from './modules/erp/erp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ErpModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
