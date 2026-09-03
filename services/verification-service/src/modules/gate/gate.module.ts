import { Module } from '@nestjs/common';
import { GateController } from './gate.controller';
import { GateService } from './gate.service';
import { VerificationService } from '../verification/verification.service';
import { createPool } from '@scango/db';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [GateController],
  providers: [
    GateService,
    VerificationService, // Assuming we want to reuse it, or we could export from VerificationModule
    {
      provide: 'DB_POOL',
      useFactory: () => {
        return createPool({
          host: process.env.POSTGRES_HOST || 'localhost',
          port: parseInt(process.env.POSTGRES_PORT || '5432'),
          user: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'postgres',
          database: 'scango_verification',
          max: 10,
        });
      },
    },
  ],
})
export class GateModule {}
