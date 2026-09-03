import { Controller, Get, Post, Patch, Delete, Query, Param, Body } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('api/v1/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async listAll() {
    return this.productService.listAll();
  }

  @Get('lookup')
  async lookup(@Query('barcode') barcode: string) {
    return this.productService.lookupByBarcode(barcode);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.productService.search(query);
  }

  @Get(':sku')
  async getBySku(@Param('sku') sku: string) {
    return this.productService.getBySku(sku);
  }

  @Post()
  async createProduct(@Body() product: any) {
    return this.productService.createProduct(product);
  }

  @Patch(':sku')
  async updateProduct(@Param('sku') sku: string, @Body() updates: any) {
    return this.productService.updateProduct(sku, updates);
  }

  @Delete(':sku')
  async deleteProduct(@Param('sku') sku: string) {
    return this.productService.deleteProduct(sku);
  }

  @Post('bulk-import')
  async bulkImport(@Body() products: any[]) {
    return this.productService.bulkImport(products);
  }
}
