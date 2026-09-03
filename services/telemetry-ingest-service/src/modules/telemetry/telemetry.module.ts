import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { TelemetryService } from './telemetry.service';
import { TelemetryConsumer } from './telemetry.consumer';

@Module({
  providers: [
    {
      provide: 'DB_POOL',
      useFactory: () => {
        return new Pool({
          connectionString: process.env.DATABASE_URL || 'postgres://scango:scango_dev_pass@postgres:5434/scango_risk',
        });
      },
    },
    TelemetryService,
    TelemetryConsumer,
  ],
})
export class TelemetryModule {}

