import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from './modules/audit/audit.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuditEvent } from './modules/audit/audit-event.entity';
import { AnalyticsKpi } from './modules/analytics/analytics-kpi.entity';

@Module({
  imports: [
    PrometheusModule.register(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgres://scango:scango_dev_pass@localhost:5434/scango_audit',
      entities: [AuditEvent, AnalyticsKpi],
      synchronize: true, // For dev only
    }),
    AuditModule,
    AnalyticsModule,
  ],
})
export class AppModule {}

