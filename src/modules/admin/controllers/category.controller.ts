import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { CategoryService } from '@$/modules/category/category.serivce';
import { CreateCategoryDto } from '@$/modules/category/dto/crateCategory.dto';
import { UpdateCategoryDto } from '@$/modules/category/dto/updateCategory.dto';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/category')
@Controller('admin/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  @HasPermissions('Read.Category')
  async getCategoriesByAdmin() {
    return this.categoryService.getCategoriesByAdmin();
  }

  @Get('/:id')
  @HasPermissions('Read.Category')
  async getCategoryByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.categoryService.getCategory(id);
  }

  @Post('/')
  @HasPermissions('Create.Category')
  async createCategoryByAdmin(@Body() body: CreateCategoryDto) {
    return this.categoryService.createCategoryByAdmin(body);
  }

  @Patch('/:id')
  @HasPermissions('Update.Category')
  async updateCategoryByAdmin(@Param('id', ParseObjectIdPipe) id: string, @Body() body: UpdateCategoryDto) {
    return this.categoryService.updateCategoryByAdmin(id, body);
  }

  @Delete('/:id')
  @HasPermissions('Delete.Category')
  async deleteCategoryByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.categoryService.deleteCategoryByAdmin(id);
  }
}
