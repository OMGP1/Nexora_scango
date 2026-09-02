import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ErpAdapter {
  private readonly logger = new Logger(ErpAdapter.name);

  recordSale(storeId: string, sku: string, quantity: number) {
    this.logger.log(`[ERP STUB] Would sync sale: Store ${storeId}, SKU ${sku}, QTY ${quantity}`);
    // No-op for Phase 7
  }
}
