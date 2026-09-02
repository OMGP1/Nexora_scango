// =====================================================
// Scaffold Script — Generates all 11 NestJS service skeletons
// Run: node scripts/scaffold-services.js
// =====================================================

const fs = require('fs');
const path = require('path');

const services = [
  { name: 'identity-service',      port: 3001, db: 'scango_identity' },
  { name: 'session-service',       port: 3002, db: 'scango_sessions' },
  { name: 'catalog-service',       port: 3003, db: null },  // MongoDB
  { name: 'cart-service',          port: 3004, db: 'scango_cart' },
  { name: 'inventory-service',     port: 3005, db: 'scango_inventory' },
  { name: 'verification-service',  port: 3006, db: 'scango_verification' },
  { name: 'payment-service',       port: 3007, db: 'scango_payments' },
  { name: 'promo-service',         port: 3008, db: 'scango_promo' },
  { name: 'notification-service',  port: 3009, db: null },  // Redis only
  { name: 'audit-service',         port: 3010, db: 'scango_audit' },
  { name: 'analytics-service',     port: 3011, db: 'scango_analytics' },
];

function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

for (const svc of services) {
  const svcDir = path.join(__dirname, '..', 'services', svc.name);
  const srcDir = path.join(svcDir, 'src');
  mkdirp(srcDir);

  // package.json
  const pkg = {
    name: `@scango/${svc.name}`,
    version: '1.0.0',
    private: true,
    scripts: {
      build: 'nest build',
      dev: `nest start --watch --port ${svc.port}`,
      start: 'node dist/main',
      lint: 'eslint src/',
      typecheck: 'tsc --noEmit',
      test: 'jest',
      'test:e2e': 'jest --config jest-e2e.config.js',
      clean: 'rimraf dist',
      'db:migrate': svc.db ? 'ts-node src/migrate.ts' : 'echo "No DB migrations"',
      seed: svc.db ? 'ts-node src/seed.ts' : 'echo "No seed data"'
    },
    dependencies: {
      '@nestjs/common': '^10.4.0',
      '@nestjs/core': '^10.4.0',
      '@nestjs/platform-express': '^10.4.0',
      'reflect-metadata': '^0.2.0',
      'rxjs': '^7.8.0',
      '@scango/common': '*',
      ...(svc.db ? { '@scango/db': '*' } : {}),
      ...(!svc.db || svc.name === 'session-service' || svc.name === 'cart-service' || svc.name === 'notification-service' ? { '@scango/redis': '*' } : {}),
      '@scango/kafka': '*',
    },
    devDependencies: {
      '@nestjs/cli': '^10.4.0',
      '@nestjs/testing': '^10.4.0',
      '@types/node': '^20.14.0',
      '@types/express': '^4.17.0',
      typescript: '^5.5.0',
      'ts-node': '^10.9.0',
      jest: '^29.7.0',
      '@types/jest': '^29.5.0',
      'ts-jest': '^29.2.0',
      rimraf: '^6.0.0',
    },
  };
  fs.writeFileSync(path.join(svcDir, 'package.json'), JSON.stringify(pkg, null, 2));

  // tsconfig.json
  const tsconfig = {
    extends: '../../tsconfig.base.json',
    compilerOptions: {
      outDir: './dist',
      rootDir: './src',
    },
    include: ['src/**/*'],
  };
  fs.writeFileSync(path.join(svcDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

  // nest-cli.json
  const nestCli = {
    $schema: 'https://json.schemastore.org/nest-cli',
    collection: '@nestjs/schematics',
    sourceRoot: 'src',
    compilerOptions: { deleteOutDir: true },
  };
  fs.writeFileSync(path.join(svcDir, 'nest-cli.json'), JSON.stringify(nestCli, null, 2));

  // main.ts
  const mainTs = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createLogger } from '@scango/common';

const logger = createLogger('${svc.name}');
const PORT = process.env.PORT || ${svc.port};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(PORT);
  logger.info({ port: PORT }, '${svc.name} is running');
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start ${svc.name}');
  process.exit(1);
});
`;
  fs.writeFileSync(path.join(srcDir, 'main.ts'), mainTs);

  // app.module.ts
  const appModule = `import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
`;
  fs.writeFileSync(path.join(srcDir, 'app.module.ts'), appModule);

  // health.controller.ts
  const healthController = `import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      service: '${svc.name}',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
`;
  fs.writeFileSync(path.join(srcDir, 'health.controller.ts'), healthController);

  // Dockerfile
  const dockerfile = `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
ENV NODE_ENV=production
EXPOSE ${svc.port}
CMD ["node", "dist/main.js"]
`;
  fs.writeFileSync(path.join(svcDir, 'Dockerfile'), dockerfile);

  console.log(`✅ Scaffolded ${svc.name} (port ${svc.port})`);
}

console.log(`\n🎉 All ${services.length} services scaffolded!`);
