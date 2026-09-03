import { Controller, Get, Param } from '@nestjs/common';
import { RiskService } from './risk.service';

@Controller('risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Get(':sessionId/tier')
  async getTier(@Param('sessionId') sessionId: string) {
    return this.riskService.calculateTier(sessionId);
  }
}
