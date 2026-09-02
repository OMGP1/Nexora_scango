import * as mongoose from 'mongoose';
import * as productsData from './fixtures/products.json';
import { createLogger } from '@scango/common';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const logger = createLogger('catalog-seed');

const ProductSchema = new mongoose.Schema({
  sku: { type: String, unique: true, required: true },
  barcode: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: String,
  unit_price: { type: Number, required: true },
  tax_class: String,
  is_weight_based: { type: Boolean, default: false },
  is_age_restricted: { type: Boolean, default: false },
  category_id: String,
  image_url: String,
  uom: String,
}, { timestamps: true });

async function seed() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://scango:scango_dev_pass@localhost:27017/scango_catalog?authSource=admin';
  logger.info({ uri: mongoUri.replace(/\/\/.*@/, '//***@') }, 'Connecting to MongoDB...');

  await mongoose.connect(mongoUri);
  const Product = mongoose.model('Product', ProductSchema);

  const products = Array.isArray(productsData) ? productsData : (productsData as any).default || [];

  const operations = products.map((p: any) => ({
    updateOne: {
      filter: { sku: p.sku },
      update: { $set: p },
      upsert: true,
    },
  }));

  const result = await Product.bulkWrite(operations);
  logger.info(`Seeded ${result.upsertedCount + result.modifiedCount} products (${result.upsertedCount} new, ${result.modifiedCount} updated).`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  logger.error({ err }, 'Failed to seed catalog');
  process.exit(1);
});
