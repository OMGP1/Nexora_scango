import { Controller, Get, Param } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('api/v1/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('sessions/:id/trail')
  async getSessionTrail(@Param('id') sessionId: string) {
    return this.auditService.getSessionTrail(sessionId);
  }
}
