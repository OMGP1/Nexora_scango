import { Controller, Get, Param } from '@nestjs/common';
import { ErpService } from './erp.service';

@Controller('api/v1/erp')
export class ErpController {
  constructor(private readonly erpService: ErpService) {}

  @Get('status/:sessionId')
  async getStatus(@Param('sessionId') sessionId: string) {
    const logs = await this.erpService.getStatus(sessionId);
    return { data: logs };
  }
}
