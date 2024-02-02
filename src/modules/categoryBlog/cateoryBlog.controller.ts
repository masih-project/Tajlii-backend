import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoryBlogService } from './categoryBlog.service';

@ApiTags('CategoryBlog')
@Controller('/categoryBlog')
export class CategoryBlogController {
  constructor(private blogService: CategoryBlogService) {}

  @Get('/')
  async getCategoriesBlog() {
    return await this.blogService.getCategoriesBlog();
  }
}
