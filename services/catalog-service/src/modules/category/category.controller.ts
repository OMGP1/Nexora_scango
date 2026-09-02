import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('api/v1/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async listCategories() {
    return this.categoryService.listCategories();
  }

  @Get(':id/products')
  async getProductsByCategory(@Param('id') id: string) {
    return this.categoryService.getProductsByCategory(id);
  }
}
