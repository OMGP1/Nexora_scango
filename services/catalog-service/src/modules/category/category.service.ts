import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async listCategories() {
    const categories = await this.categoryModel.find().lean().exec();
    return { success: true, data: categories };
  }

  async getProductsByCategory(categoryId: string) {
    const products = await this.productModel.find({ category_id: categoryId }).lean().exec();
    return { success: true, data: products };
  }
}
