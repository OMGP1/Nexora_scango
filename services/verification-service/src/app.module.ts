import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { VerificationModule } from './modules/verification/verification.module';
import { GateModule } from './modules/gate/gate.module';

import { HealthController } from './health.controller';

@Module({
  imports: [
    PrometheusModule.register(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgres://scango:scango_dev_pass@localhost:5434/scango_verification',
      entities: [],
      synchronize: true, // DEV ONLY
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    VerificationModule,
    GateModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}

