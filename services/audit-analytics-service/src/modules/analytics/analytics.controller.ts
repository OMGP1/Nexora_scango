import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpis')
  async getKpis() {
    const kpis = await this.analyticsService.getKpis();
    if (kpis.length === 0) {
      return {
        sessions_today: 0,
        completed_today: 0,
        revenue_today: 0,
        exception_rate: '0%'
      };
    }
    
    const kpi = kpis[0];
    const excRate = kpi.sessions_started > 0 ? ((kpi.verification_holds / kpi.sessions_started) * 100).toFixed(1) : 0;

    return {
      sessions_today: kpi.sessions_started,
      completed_today: kpi.sessions_completed,
      revenue_today: kpi.revenue_total,
      exception_rate: `${excRate}%`
    };
  }
}
