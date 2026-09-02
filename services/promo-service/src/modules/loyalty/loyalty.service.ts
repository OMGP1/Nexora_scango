import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);
  private readonly REDEMPTION_RATE = 10; // 100 points = 10 INR -> 1 point = 0.1 INR

  constructor(@Inject('DB_POOL') private pool: Pool) {}

  async getBalance(customerId: string) {
    const res = await this.pool.query(
      `SELECT points_balance FROM loyalty_accounts WHERE customer_id = $1`,
      [customerId]
    );
    if (res.rows.length === 0) return { customer_id: customerId, points_balance: 0 };
    return { customer_id: customerId, points_balance: res.rows[0].points_balance };
  }

  async accruePoints(customerId: string, amountSpent: number) {
    // 1 point per 10 INR spent
    const pointsToAccrue = Math.floor(amountSpent / 10);
    if (pointsToAccrue <= 0) return;

    await this.pool.query(
      `INSERT INTO loyalty_accounts (customer_id, points_balance, lifetime_points)
       VALUES ($1, $2, $2)
       ON CONFLICT (customer_id) DO UPDATE SET 
       points_balance = loyalty_accounts.points_balance + $2,
       lifetime_points = loyalty_accounts.lifetime_points + $2,
       last_updated = CURRENT_TIMESTAMP`,
      [customerId, pointsToAccrue]
    );
    this.logger.log(`Accrued ${pointsToAccrue} points for customer ${customerId}`);
  }

  async redeemPoints(customerId: string, pointsToRedeem: number) {
    const balanceRes = await this.getBalance(customerId);
    if (balanceRes.points_balance < pointsToRedeem) {
      return { success: false, reason: 'Insufficient points' };
    }

    const discountAmount = pointsToRedeem * (this.REDEMPTION_RATE / 100);

    await this.pool.query(
      `UPDATE loyalty_accounts 
       SET points_balance = points_balance - $1, last_updated = CURRENT_TIMESTAMP
       WHERE customer_id = $2`,
      [pointsToRedeem, customerId]
    );

    return { 
      success: true, 
      redeemed_points: pointsToRedeem, 
      discount_amount: discountAmount 
    };
  }
}
