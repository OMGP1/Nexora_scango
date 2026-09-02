import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductService } from './modules/product/product.service';
import * as productsData from './fixtures/products.json';
import * as mongoose from 'mongoose';
import { createLogger } from '@scango/common';

const logger = createLogger('catalog-seed');

async function bootstrap() {
  logger.info('Starting catalog seed...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const productService = app.get(ProductService);
  
  try {
    const result = await productService.bulkImport(productsData);
    logger.info(`Successfully imported ${result.imported} products.`);
  } catch (error) {
    logger.error({ error }, 'Failed to seed products');
  } finally {
    await mongoose.disconnect();
    await app.close();
    process.exit(0);
  }
}

bootstrap();
