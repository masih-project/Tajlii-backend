import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { BlogService } from '@$/modules/blog/blog.service';
import { CreateBlogDto } from '@$/modules/blog/dto/create-blog.dto';
import { UpdateBlogDto } from '@$/modules/blog/dto/update-blog.dto';
import { GetAdmin } from '@$/common/decorators/get-admin.decorator';
import { AdminDocument } from '../schemas/admin.schema';
import { QueryBlog, QueryBlogByAdmin } from '@$/modules/blog/dto/query-blog.dto';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/blog')
@Controller('admin/blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('/')
  @HasPermissions('Read.Blog')
  async getBlogsByAdmin(@Query() query: QueryBlogByAdmin) {
    return this.blogService.getBlogsByAdmin(query);
  }

  @Get('/:id')
  @HasPermissions('Read.Blog')
  async getBlogByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.blogService.getBlogByAdmin(id);
  }

  @Post('/')
  @HasPermissions('Create.Blog')
  async createBlogByAdmin(@GetAdmin() admin: AdminDocument, @Body() body: CreateBlogDto) {
    return this.blogService.createBlogByAdmin(admin, body);
  }

  @Patch('/:id')
  @HasPermissions('Update.Blog')
  async updateBlogByAdmin(@Param('id', ParseObjectIdPipe) id: string, @Body() body: UpdateBlogDto) {
    return this.blogService.updateBlogByAdmin(id, body);
  }

  @Delete('/:id')
  @HasPermissions('Delete.Blog')
  async deleteBlogByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.blogService.deleteBlogByAdmin(id);
  }
}
