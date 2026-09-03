import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);
  private readonly REDEMPTION_RATE = 100; // 1 coin = 1 INR (100%)

  constructor(@Inject('DB_POOL') private pool: Pool) {}

  async getBalance(customerId: string) {
    const res = await this.pool.query(
      `SELECT coins_balance FROM loyalty_accounts WHERE customer_id = $1`,
      [customerId]
    );
    if (res.rows.length === 0) return { customer_id: customerId, coins_balance: 0 };
    return { customer_id: customerId, coins_balance: res.rows[0].coins_balance };
  }

  async accrueCoins(customerId: string, amountSpent: number) {
    // 1 coin per 100 INR spent (1% cashback)
    const coinsToAccrue = Math.floor(amountSpent / 100);
    if (coinsToAccrue <= 0) return;

    await this.pool.query(
      `INSERT INTO loyalty_accounts (customer_id, coins_balance, lifetime_coins)
       VALUES ($1, $2, $2)
       ON CONFLICT (customer_id) DO UPDATE SET 
       coins_balance = loyalty_accounts.coins_balance + $2,
       lifetime_coins = loyalty_accounts.lifetime_coins + $2,
       last_updated = CURRENT_TIMESTAMP`,
      [customerId, coinsToAccrue]
    );
    this.logger.log(`Accrued ${coinsToAccrue} coins for customer ${customerId}`);
  }

  async redeemCoins(customerId: string, coinsToRedeem: number, cartSubtotal: number) {
    const balanceRes = await this.getBalance(customerId);
    if (balanceRes.coins_balance < coinsToRedeem) {
      return { success: false, reason: 'Insufficient coins' };
    }

    let discountAmount = coinsToRedeem * (this.REDEMPTION_RATE / 100);
    let actualCoinsRedeemed = coinsToRedeem;

    if (discountAmount > cartSubtotal) {
      discountAmount = cartSubtotal;
      actualCoinsRedeemed = Math.ceil(discountAmount / (this.REDEMPTION_RATE / 100));
    }

    await this.pool.query(
      `UPDATE loyalty_accounts 
       SET coins_balance = coins_balance - $1, last_updated = CURRENT_TIMESTAMP
       WHERE customer_id = $2`,
      [actualCoinsRedeemed, customerId]
    );

    return { 
      success: true, 
      redeemed_coins: actualCoinsRedeemed, 
      discount_amount: discountAmount 
    };
  }
}
