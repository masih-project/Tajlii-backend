import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.serivce';

@ApiTags('Category')
@Controller('/')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/category')
  async getCategories() {
    return this.categoryService.getCategories();
  }

  @Get('/category/:slug')
  async getCategory(@Param('slug') slug: string) {
    return this.categoryService.getCategory(slug);
  }
}
