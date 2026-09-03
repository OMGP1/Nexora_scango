import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('api/v1/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':storeId/:sku')
  async getInventory(
    @Param('storeId') storeId: string,
    @Param('sku') sku: string
  ) {
    const data = await this.inventoryService.getInventory(storeId, sku);
    return { success: true, data };
  }

  @Get(':storeId')
  async getAllInventory(@Param('storeId') storeId: string) {
    const data = await this.inventoryService.getAllInventory(storeId);
    return { success: true, data };
  }

  @Post(':storeId/receive')
  async receiveStock(
    @Param('storeId') storeId: string,
    @Body('sku') sku: string,
    @Body('quantity') quantity: number,
    @Body('received_by') receivedBy: string
  ) {
    const data = await this.inventoryService.receiveStock(storeId, sku, quantity, receivedBy);
    return { success: true, data };
  }

  @Post(':storeId/adjust')
  async adjustStock(
    @Param('storeId') storeId: string,
    @Body('sku') sku: string,
    @Body('quantity') quantity: number,
    @Body('reason') reason: string,
    @Body('adjusted_by') adjustedBy: string
  ) {
    const data = await this.inventoryService.adjustStock(storeId, sku, quantity, reason, adjustedBy);
    return { success: true, data };
  }

  @Post(':storeId/reserve')
  async reserveItem(
    @Param('storeId') storeId: string,
    @Body('sku') sku: string,
    @Body('quantity') quantity: number,
    @Body('session_id') sessionId: string,
    @Body('event_id') eventId?: string
  ) {
    const eid = eventId || `http-reserve-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await this.inventoryService.reserveItem(eid, storeId, sku, quantity, sessionId);
    return { success: true };
  }

  @Post(':storeId/release')
  async releaseItem(
    @Param('storeId') storeId: string,
    @Body('sku') sku: string,
    @Body('quantity') quantity: number,
    @Body('session_id') sessionId: string,
    @Body('event_id') eventId?: string
  ) {
    const eid = eventId || `http-release-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await this.inventoryService.releaseItem(eid, storeId, sku, quantity, sessionId);
    return { success: true };
  }

  @Post(':storeId/confirm-sale')
  async confirmSale(
    @Param('storeId') storeId: string,
    @Body('session_id') sessionId: string,
    @Body('event_id') eventId?: string
  ) {
    const eid = eventId || `http-sale-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { ErpAdapter } = await import('./erp.adapter');
    const erpAdapter = new ErpAdapter();
    await this.inventoryService.confirmSale(eid, sessionId, storeId, erpAdapter);
    return { success: true };
  }

  @Get(':storeId/ledger')
  async getLedger(@Param('storeId') storeId: string) {
    const data = await this.inventoryService.getLedger(storeId);
    return { success: true, data };
  }
}
