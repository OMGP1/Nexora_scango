import { Injectable, Inject, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { createKafkaClient } from '@scango/kafka';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';
import { getTaxRate } from '../../config/tax-rates';
import { calculateBill, CartItem } from './utils/bill-calculator';

@Injectable()
export class CartService {
  private redis: Redis;
  private kafkaProducer: any;

  constructor(
    @Inject('DB_POOL') private pool: Pool,
    private httpService: HttpService
  ) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    const kafka = createKafkaClient({
      clientId: 'cart-service',
      brokers: [process.env.KAFKA_BROKERS || process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.kafkaProducer = kafka.producer();
    this.kafkaProducer.connect().catch((err: any) => console.error('Kafka connect error', err));
  }

  private async publishEvent(topic: string, payload: any) {
    try {
      await this.kafkaProducer.send({
        topic,
        messages: [{ value: JSON.stringify(payload) }],
      });
    } catch (err) {
      console.error(`Failed to publish event ${topic}`, err);
    }
  }

  private async getProductInfo(barcode: string): Promise<any> {
    try {
      // Assuming catalog-service is reachable at localhost:3002 internally or via gateway
      const catalogUrl = process.env.CATALOG_SERVICE_URL || 'http://localhost:3003/api/v1/products';
      console.log(`[cart-service] Looking up barcode: "${barcode}" at ${catalogUrl}`);
      const response = await firstValueFrom(this.httpService.get(`${catalogUrl}/lookup?barcode=${barcode}`));
      return response.data.data;
    } catch (error: any) {
      console.error(`[cart-service] Lookup failed for barcode "${barcode}":`, error.message);
      throw new NotFoundException('Product not found in catalog');
    }
  }

  private async getCartState(sessionId: string): Promise<{ items: CartItem[], appliedPromo?: any }> {
    const data = await this.redis.hgetall(`cart:${sessionId}`);
    const cartItems: CartItem[] = [];
    let appliedPromo = undefined;
    
    for (const key of Object.keys(data)) {
      if (key === 'summary') {
        const summary = JSON.parse(data[key]);
        if (summary.applied_promo) {
          appliedPromo = summary.applied_promo;
        }
      } else {
        cartItems.push(JSON.parse(data[key]));
      }
    }
    return { items: cartItems, appliedPromo };
  }

  private async saveCartState(sessionId: string, items: CartItem[], appliedPromo?: any) {
    const multi = this.redis.multi();
    const bill = calculateBill(items, appliedPromo);
    
    multi.del(`cart:${sessionId}`);
    if (items.length > 0) {
      const summaryPayload: any = { ...bill.bill_summary };
      if (appliedPromo) {
        summaryPayload.applied_promo = appliedPromo;
      }
      const hashData: Record<string, string> = { summary: JSON.stringify(summaryPayload) };
      for (const item of items) {
        hashData[item.cart_item_id] = JSON.stringify(item);
      }
      multi.hset(`cart:${sessionId}`, hashData);
      multi.expire(`cart:${sessionId}`, 24 * 60 * 60);
    }
    await multi.exec();
    return bill;
  }

  async applyPromo(sessionId: string, promoCode: string) {
    const state = await this.getCartState(sessionId);
    if (state.items.length === 0) {
      throw new BadRequestException('Cannot apply promo to empty cart');
    }

    const bill = calculateBill(state.items); // calculate current bill without discount
    
    try {
      const promoUrl = process.env.PROMO_SERVICE_URL || 'http://localhost:3004/api/v1/promo';
      const res = await firstValueFrom(this.httpService.post(`${promoUrl}/validate`, {
        promo_code: promoCode,
        session_id: sessionId,
        basket_summary: bill.bill_summary
      }));

      const promoResult = res.data;
      if (!promoResult.valid) {
        return { success: false, reason: promoResult.reason };
      }

      const appliedPromo = {
        promo_code: promoCode,
        discount_amount: promoResult.discount_amount
      };

      const updatedBill = await this.saveCartState(sessionId, state.items, appliedPromo);
      return { success: true, data: updatedBill };

    } catch (e) {
      return { success: false, reason: 'Failed to validate promo' };
    }
  }

  async addItem(sessionId: string, barcode: string, quantity: number = 1, weight?: number, scanSource: string = 'camera') {
    // 1. Debounce check
    const debounceKey = `debounce:${sessionId}:${barcode}`;
    const isDuplicate = await this.redis.set(debounceKey, '1', 'EX', 3, 'NX');
    if (!isDuplicate) {
      throw new ConflictException('Duplicate scan detected');
    }

    // 2. Fetch product
    const product = await this.getProductInfo(barcode);
    
    // 3. Validate weight based
    if (product.is_weight_based && !weight) {
      throw new BadRequestException('Weight is required for this product');
    }

    const state = await this.getCartState(sessionId);
    const existingItemIndex = state.items.findIndex(i => i.sku === product.sku);
    let cartItem: CartItem;

    if (existingItemIndex > -1 && !product.is_weight_based) {
      // 4a. Update existing item
      cartItem = state.items[existingItemIndex];
      cartItem.quantity += quantity;
      cartItem.line_total = Number((cartItem.unit_price * cartItem.quantity).toFixed(2));
      cartItem.tax_amount = Number((cartItem.line_total * cartItem.tax_rate).toFixed(2));
      
      state.items[existingItemIndex] = cartItem;
      const updatedBill = await this.saveCartState(sessionId, state.items, state.appliedPromo);

      await this.pool.query(
        `UPDATE cart_items SET quantity = $1, line_total = $2, tax_amount = $3 WHERE cart_item_id = $4`,
        [cartItem.quantity, cartItem.line_total, cartItem.tax_amount, cartItem.cart_item_id]
      );
      
      await this.publishEvent('item.updated', {
        session_id: sessionId,
        cart_item_id: cartItem.cart_item_id,
        sku: cartItem.sku,
        quantity: cartItem.quantity
      });

      return { success: true, data: updatedBill };
    } else {
      // 4b. Add new item
      const effectiveQty = product.is_weight_based ? 1 : quantity;
      const effectiveWeight = product.is_weight_based ? weight : undefined;
      
      const lineTotal = product.is_weight_based 
        ? product.unit_price * weight! 
        : product.unit_price * quantity;

      const taxRate = getTaxRate(product.tax_class);
      const taxAmount = lineTotal * taxRate;

      cartItem = {
        cart_item_id: uuidv4(),
        sku: product.sku,
        name: product.name,
        image_url: product.image_url,
        unit_price: product.unit_price,
        quantity: effectiveQty,
        weight: effectiveWeight,
        line_total: Number(lineTotal.toFixed(2)),
        tax_rate: taxRate,
        tax_amount: Number(taxAmount.toFixed(2)),
        requires_assisted_verification: product.is_age_restricted || false,
      };

      state.items.push(cartItem);
      const updatedBill = await this.saveCartState(sessionId, state.items, state.appliedPromo);

      await this.pool.query(
        `INSERT INTO cart_items (cart_item_id, session_id, sku, quantity, weight, unit_price, line_total, tax_rate, tax_amount, requires_assisted_verification, scan_source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [cartItem.cart_item_id, sessionId, cartItem.sku, cartItem.quantity, cartItem.weight || null, cartItem.unit_price, cartItem.line_total, cartItem.tax_rate, cartItem.tax_amount, cartItem.requires_assisted_verification, scanSource]
      );

      await this.publishEvent('item.scanned', {
        session_id: sessionId,
        cart_item_id: cartItem.cart_item_id,
        sku: cartItem.sku,
        quantity: cartItem.quantity,
        requires_verification: cartItem.requires_assisted_verification
      });

      return { success: true, data: updatedBill };
    }
  }

  async updateItem(sessionId: string, itemId: string, updates: { quantity?: number, weight?: number }) {
    const state = await this.getCartState(sessionId);
    const itemIndex = state.items.findIndex(i => i.cart_item_id === itemId);
    if (itemIndex === -1) throw new NotFoundException('Item not found in cart');

    const item = state.items[itemIndex];
    if (updates.quantity !== undefined && !item.weight) {
      item.quantity = updates.quantity;
      item.line_total = item.unit_price * item.quantity;
    } else if (updates.weight !== undefined && item.weight) {
      item.weight = updates.weight;
      item.line_total = item.unit_price * item.weight;
    }
    
    item.tax_amount = item.line_total * item.tax_rate;
    item.line_total = Number(item.line_total.toFixed(2));
    item.tax_amount = Number(item.tax_amount.toFixed(2));

    const updatedBill = await this.saveCartState(sessionId, state.items, state.appliedPromo);

    await this.pool.query(
      `UPDATE cart_items SET quantity = $1, weight = $2, line_total = $3, tax_amount = $4 WHERE cart_item_id = $5`,
      [item.quantity, item.weight || null, item.line_total, item.tax_amount, itemId]
    );

    await this.publishEvent('item.updated', { session_id: sessionId, cart_item_id: itemId });

    return { success: true, data: updatedBill };
  }

  async removeItem(sessionId: string, itemId: string) {
    let state = await this.getCartState(sessionId);
    state.items = state.items.filter(i => i.cart_item_id !== itemId);
    
    const updatedBill = await this.saveCartState(sessionId, state.items, state.appliedPromo);

    await this.pool.query(
      `UPDATE cart_items SET removed_at = CURRENT_TIMESTAMP WHERE cart_item_id = $1`,
      [itemId]
    );

    await this.publishEvent('item.removed', { session_id: sessionId, cart_item_id: itemId });

    return { success: true, data: updatedBill };
  }

  async getBill(sessionId: string) {
    const state = await this.getCartState(sessionId);
    return { success: true, data: calculateBill(state.items, state.appliedPromo) };
  }
}
