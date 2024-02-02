import { Module } from '@nestjs/common';
import { categoryBlogSchema } from './categoryBlog.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryBlogController } from './cateoryBlog.controller';
import { CategoryBlogService } from './categoryBlog.service';
import { PublicUtils } from '../../utils/public-utils';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'categoriesBlog', schema: categoryBlogSchema }])],
  controllers: [CategoryBlogController],
  providers: [CategoryBlogService, PublicUtils],
  exports: [CategoryBlogService],
})
export class CategoryBlogModule {}
