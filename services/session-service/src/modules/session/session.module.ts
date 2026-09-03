import { Module } from '@nestjs/common';
import { createPool } from '@scango/db';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionExpiryJob } from './jobs/session-expiry.job';

// Normally, DB_POOL is provided by a global DbModule.
// For the sake of simplicity, we provide it here directly if not already global.
@Module({
  controllers: [SessionController],
  providers: [
    SessionService,
    SessionExpiryJob,
    {
      provide: 'DB_POOL',
      useFactory: () => {
        return createPool({
          host: process.env.POSTGRES_HOST || 'localhost',
          port: parseInt(process.env.POSTGRES_PORT || '5432'),
          user: process.env.POSTGRES_USER || 'scango',
          password: process.env.POSTGRES_PASSWORD || 'scango_dev_pass',
          database: 'scango_sessions',
          max: 10,
        });
      },
    },
  ],
  exports: ['DB_POOL']
})
export class SessionModule {}
