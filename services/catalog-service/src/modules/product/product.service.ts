import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import Redis from 'ioredis';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ProductService {
  private redis: Redis;
  private elasticsearch: Client;

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.elasticsearch = new Client({ node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200' });
  }

  async lookupByBarcode(barcode: string) {
    const cacheKey = `product:barcode:${barcode}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return { success: true, data: JSON.parse(cached), source: 'cache' };
    }

    const product = await this.productModel.findOne({ barcode }).lean().exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.redis.set(cacheKey, JSON.stringify(product), 'EX', 300); // 5 mins TTL

    return { success: true, data: product, source: 'db' };
  }

  async getBySku(sku: string) {
    const product = await this.productModel.findOne({ sku }).lean().exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return { success: true, data: product };
  }

  async search(query: string) {
    try {
      const result = await this.elasticsearch.search({
        index: 'products',
        query: {
          multi_match: {
            query,
            fields: ['name', 'description', 'category_name'],
            fuzziness: 'AUTO'
          }
        }
      });
      return { success: true, data: result.hits.hits.map((h: any) => h._source) };
    } catch (error) {
      // Fallback to mongo text search if ES is down/empty
      const products = await this.productModel.find({ $text: { $search: query } }).lean().exec();
      return { success: true, data: products, source: 'mongo-fallback' };
    }
  }

  async bulkImport(products: any[]) {
    // Upsert products to Mongo
    const operations = products.map(p => ({
      updateOne: {
        filter: { sku: p.sku },
        update: { $set: p },
        upsert: true
      }
    }));
    await this.productModel.bulkWrite(operations);

    // Sync to Elasticsearch
    const esOperations = products.flatMap(doc => [
      { index: { _index: 'products', _id: doc.sku } },
      doc
    ]);
    if (esOperations.length > 0) {
      try {
        await this.elasticsearch.bulk({ refresh: true, body: esOperations });
      } catch (err) {
        console.error('Failed to sync to ES', err);
      }
    }

    return { success: true, imported: products.length };
  }
}
