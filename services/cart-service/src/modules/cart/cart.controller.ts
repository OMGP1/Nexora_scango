import { Controller, Post, Get, Delete, Patch, Param, Body } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('api/v1/sessions/:id')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  async addItem(
    @Param('id') sessionId: string,
    @Body('barcode') barcode: string,
    @Body('quantity') quantity?: number,
    @Body('weight') weight?: number,
    @Body('scan_source') scanSource?: string
  ) {
    return this.cartService.addItem(sessionId, barcode, quantity, weight, scanSource);
  }

  @Patch('items/:itemId')
  async updateItem(
    @Param('id') sessionId: string,
    @Param('itemId') itemId: string,
    @Body('quantity') quantity?: number,
    @Body('weight') weight?: number
  ) {
    return this.cartService.updateItem(sessionId, itemId, { quantity, weight });
  }

  @Delete('items/:itemId')
  async removeItem(
    @Param('id') sessionId: string,
    @Param('itemId') itemId: string
  ) {
    return this.cartService.removeItem(sessionId, itemId);
  }

  @Get('bill')
  async getBill(@Param('id') sessionId: string) {
    return this.cartService.getBill(sessionId);
  }

  @Post('promo')
  async applyPromo(@Param('id') sessionId: string, @Body('promo_code') promoCode: string) {
    if (!promoCode) {
      return { success: false, reason: 'Promo code required' };
    }
    return this.cartService.applyPromo(sessionId, promoCode);
  }
}
