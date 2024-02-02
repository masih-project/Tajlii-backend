import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { UpdateCategoryDto } from '@$/modules/category/dto/updateCategory.dto';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { CategoryBlogService } from '../../categoryBlog/categoryBlog.service';
import { CreateCategoryBlogDto } from '@$/modules/categoryBlog/dto/create-category-blog.dto';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/categoryBlog')
@Controller('admin/categoryBlog')
export class CategoryBlogController {
  constructor(private readonly categoryBlogService: CategoryBlogService) {}

  @Get('/')
  @HasPermissions('Read.CategoryBlog')
  async getCategoriesBlogByAdmin() {
    return this.categoryBlogService.getCategoriesBlogByAdmin();
  }

  @Get('/:id')
  @HasPermissions('Read.CategoryBlog')
  async getCategoryBlogByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.categoryBlogService.getCategoryBlogByAdmin(id);
  }

  @Post('/')
  @HasPermissions('Create.CategoryBlog')
  async createCategoryBlogByAdmin(@Body() body: CreateCategoryBlogDto) {
    return this.categoryBlogService.createCategoryBlogByAdmin(body);
  }

  @Patch('/:id')
  @HasPermissions('Update.CategoryBlog')
  async updateCategoryBlogByAdmin(@Param('id', ParseObjectIdPipe) id: string, @Body() body: UpdateCategoryDto) {
    return this.categoryBlogService.updateCategoryBlogByAdmin(id, body);
  }

  @Delete('/:id')
  @HasPermissions('Delete.CategoryBlog')
  async deleteCategoryBlogByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.categoryBlogService.deleteCategoryBlogByAdmin(id);
  }
}
