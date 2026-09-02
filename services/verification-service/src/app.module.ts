import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { VerificationModule } from './modules/verification/verification.module';
import { GateModule } from './modules/gate/gate.module';
import { VerificationSession } from './modules/verification/verification-session.entity';
import { HealthController } from './health.controller';

@Module({
  imports: [
    PrometheusModule.register(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/scango_verification',
      entities: [VerificationSession],
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
