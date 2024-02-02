import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { BlogService } from '@$/modules/blog/blog.service';
import { QueryBlogCommentByAdminDto } from '@$/modules/blog/dto/query-blog-comment-admin.dto';
import { UpdateCommentBlogDto } from '@$/modules/blog/dto/update-comment-blog.dto';
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { query } from 'express';

@ApiTags('admin/BlogComment')
@Controller('/admin/blogComment')
export class BlogCommentController {
  constructor(private blogService: BlogService) {}
  @Get('/')
  async getCommentsBlogByAdmin(@Query() query: QueryBlogCommentByAdminDto) {
    return await this.blogService.getCommentsBlogByAdmin(query);
  }

  @Get('/:id')
  async getCommentBlogByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return await this.blogService.getCommentBlogByAdmin(id);
  }

  @Patch('/:id')
  async updateCommentBlogByAdmin(@Param('id', ParseObjectIdPipe) id: string, @Body() body: UpdateCommentBlogDto) {
    return await this.blogService.updateCommentBlogByAdmin(id, body);
  }
}
