import { Module } from '@nestjs/common';
import { createPool } from '@scango/db';
import { HttpModule } from '@nestjs/axios';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [HttpModule],
  controllers: [VerificationController],
  providers: [
    VerificationService,
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
export class VerificationModule {}
