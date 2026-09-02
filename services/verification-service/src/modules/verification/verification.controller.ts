import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { VerificationService } from './verification.service';

@Controller('api/v1/sessions')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get(':id/verification')
  async getTier(@Param('id') sessionId: string) {
    const data = await this.verificationService.getTier(sessionId);
    return { success: true, data };
  }

  @Post(':id/verification/compute')
  async computeTier(@Param('id') sessionId: string, @Body('customer_id') customerId: string) {
    const data = await this.verificationService.computeTier(sessionId, customerId || 'guest');
    return { success: true, data };
  }
}
