import { Module, Global } from '@nestjs/common';
import { createPool } from '@scango/db';
import { loadConfig, postgresConfigSchema, createLogger } from '@scango/common';

const logger = createLogger('identity-db');

const dbProvider = {
  provide: 'DB_POOL',
  useFactory: () => {
    const config = loadConfig(postgresConfigSchema);
    logger.info('Initializing DB pool for identity-service');
    return createPool({
      host: config.POSTGRES_HOST,
      port: config.POSTGRES_PORT,
      user: config.POSTGRES_USER,
      password: config.POSTGRES_PASSWORD,
      database: 'scango_identity',
    });
  },
};

@Global()
@Module({
  providers: [dbProvider],
  exports: ['DB_POOL'],
})
export class DbModule {}
