import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { RmnModule } from './modules/rmn/rmn.module';
import { Pool } from 'pg';

@Module({
  imports: [RmnModule],
  controllers: [HealthController],
  providers: [
    {
      provide: 'DB_POOL',
      useFactory: () => {
        return new Pool({
          connectionString: process.env.DATABASE_URL || 'postgresql://scango:scango_dev_pass@localhost:5434/scango_main',
        });
      },
    },
  ],
})
export class AppModule {}

