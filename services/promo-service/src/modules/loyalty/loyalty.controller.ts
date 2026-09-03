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
    @Body('coins') coins: number,
    @Body('cartSubtotal') cartSubtotal: number
  ) {
    if (!coins || coins <= 0) {
      return { success: false, reason: 'Invalid coins' };
    }
    if (cartSubtotal === undefined || cartSubtotal < 0) {
      return { success: false, reason: 'Invalid cartSubtotal' };
    }
    const data = await this.loyaltyService.redeemCoins(customerId, coins, cartSubtotal);
    return data;
  }
}
