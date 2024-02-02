import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';
import { LoggerUtils } from 'src/utils/logger-utils';
import { userSchema } from '../user/schema/user.schema';
import { CommentController } from './commentController';
import { commentSchema } from './comment.schema';
import { CommentService } from './commentService';
import { productSchema } from '../product/schemas/product.schema';
import { adminSchema } from '../admin/schemas/admin.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'comments', schema: commentSchema },
      { name: 'admins', schema: adminSchema },
      { name: 'users', schema: userSchema },
      { name: 'products', schema: productSchema },
    ]),
  ],
  controllers: [CommentController],
  providers: [JWTUtils, LoggerUtils, CommentService],
  exports: [CommentService],
})
export class CommentModule {}
