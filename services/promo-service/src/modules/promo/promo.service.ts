import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PromoService {
  private readonly logger = new Logger(PromoService.name);

  constructor(@Inject('DB_POOL') private pool: Pool) {}

  async validatePromo(promoCode: string, _sessionId: string, basketSummary: any, customerId: string = 'guest') {
    this.logger.debug(`Validating promo ${promoCode} for customer ${customerId}`);
    const res = await this.pool.query(
      `SELECT * FROM promotions WHERE promo_code = $1`,
      [promoCode.toUpperCase()]
    );

    if (res.rows.length === 0) {
      return { valid: false, reason: 'Invalid promotion code' };
    }

    const promo = res.rows[0];

    // Check expiry
    if (promo.valid_to && new Date(promo.valid_to) < new Date()) {
      return { valid: false, reason: 'Promotion has expired' };
    }

    // Check usage limits
    if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
      return { valid: false, reason: 'Promotion usage limit exceeded' };
    }

    // Check minimum basket value
    if (promo.min_basket_value && basketSummary.subtotal < parseFloat(promo.min_basket_value)) {
      return { valid: false, reason: `Minimum basket value of ₹${promo.min_basket_value} required` };
    }

    // Check loyalty constraints (simplified: guest vs known customer)
    if (promo.loyalty_only && customerId === 'guest') {
      return { valid: false, reason: 'Promotion only valid for loyalty members' };
    }

    // Calculate discount
    let discountAmount = 0;
    const subtotal = parseFloat(basketSummary.subtotal) || 0;

    switch (promo.type) {
      case 'PERCENTAGE':
        discountAmount = (subtotal * parseFloat(promo.discount_value)) / 100;
        break;
      case 'FLAT':
        discountAmount = parseFloat(promo.discount_value);
        break;
      // V1 handles Buy X Get Y and Category on the total level for simplicity if items aren't perfectly mapped
      case 'BUY_X_GET_Y':
      case 'CATEGORY':
      default:
        discountAmount = parseFloat(promo.discount_value);
    }

    // Cap at subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return { 
      valid: true, 
      discount_type: promo.type, 
      discount_amount: discountAmount,
      promo_code: promo.promo_code 
    };
  }
}
