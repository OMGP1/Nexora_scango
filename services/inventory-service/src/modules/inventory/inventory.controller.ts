import { Controller, Get, Param } from '@nestjs/common';
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
}
