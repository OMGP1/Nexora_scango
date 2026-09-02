import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ReconciliationJob {
  private readonly logger = new Logger(ReconciliationJob.name);

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  handleCron() {
    this.logger.log('Reconciliation not yet configured — would compare ScanGo ledger vs. ERP');
  }
}
