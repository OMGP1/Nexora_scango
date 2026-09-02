import { Controller, Post, Body } from '@nestjs/common';
import { PromoService } from './promo.service';

@Controller('api/v1/promo')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Post('validate')
  async validate(@Body() body: any) {
    const { promo_code, session_id, basket_summary, customer_id } = body;
    if (!promo_code || !basket_summary) {
      return { valid: false, reason: 'Missing promo_code or basket_summary' };
    }
    const result = await this.promoService.validatePromo(promo_code, session_id, basket_summary, customer_id);
    return result;
  }
}
