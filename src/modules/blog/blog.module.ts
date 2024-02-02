import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicUtils } from '../../utils/public-utils';
import { adminSchema } from '../admin/schemas/admin.schema';
import { blogSchema } from './schema/blog.schema';
import { BlogRating, blogRatingSchema } from './schema/blog-rating.schema';
import { JWTUtils } from '@$/utils/jwt-utils';
import { userSchema } from '../user/schema/user.schema';
import { BlogView, blogViewSchema } from './schema/blog-view.schema';
import { blogCommentSchema } from './schema/comment-blog.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'blogs', schema: blogSchema },
      { name: 'blogComments', schema: blogCommentSchema },
      { name: 'admins', schema: adminSchema },
      { name: 'users', schema: userSchema },
      { name: BlogRating.name, schema: blogRatingSchema },
      { name: BlogView.name, schema: blogViewSchema },
    ]),
  ],
  controllers: [BlogController],
  providers: [JWTUtils, BlogService, PublicUtils],
  exports: [BlogService],
})
export class BlogModule {}
