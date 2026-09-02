import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';

@Controller('api/v1/loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get(':customerId/balance')
  async getBalance(@Param('customerId') customerId: string) {
    const data = await this.loyaltyService.getBalance(customerId);
    return { success: true, data };
  }

  @Post(':customerId/redeem')
  async redeem(
    @Param('customerId') customerId: string,
    @Body('points') points: number
  ) {
    if (!points || points <= 0) {
      return { success: false, reason: 'Invalid points' };
    }
    const data = await this.loyaltyService.redeemPoints(customerId, points);
    return data;
  }
}
