import { CategoryController } from './category.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';
import { categorySchema } from './category.schema';
import { CategoryService } from './category.serivce';
import { PublicUtils } from 'src/utils/public-utils';
import { adminSchema } from '../admin/schemas/admin.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'categories', schema: categorySchema },
      { name: 'admins', schema: adminSchema },
    ]),
  ],
  controllers: [CategoryController],
  providers: [JWTUtils, CategoryService, PublicUtils],
  exports: [CategoryService],
})
export class CategoryModule {}
