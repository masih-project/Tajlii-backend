import { productSchema } from './schemas/product.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';
import { PublicUtils } from 'src/utils/public-utils';
import { ProductController } from './product.controller';
import { ProductService } from './services/product.service';
import { ProductLogger } from 'src/logger/product/productLogger';
import { LoggerUtils } from 'src/utils/logger-utils';

import { userSchema } from '../user/schema/user.schema';
import { commentSchema } from '../comment/comment.schema';
import { BookMarkSchema } from '../bookMark/bookMark.schema';
import { settingSchema } from '../settings/setting.schema';
import { adminSchema } from '../admin/schemas/admin.schema';
import { ProductView, productViewSchema } from './schemas/product-view.schema';
import { ProductViewService } from './services/product-view.service';
import { ProductRating, productRatingSchema } from './schemas/product-rating.schema';
import { ProductRatingService } from './services/product-rating.service';
import { brandSchema } from '../brand/brand.schema';
import { categorySchema } from '../category/category.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'comments', schema: commentSchema },
      { name: 'brands', schema: brandSchema },
      { name: 'categories', schema: categorySchema },
      { name: 'products', schema: productSchema },
      { name: 'admins', schema: adminSchema },
      { name: 'users', schema: userSchema },
      { name: 'bookMarks', schema: BookMarkSchema },
      { name: 'settings', schema: settingSchema },
      { name: ProductView.name, schema: productViewSchema },
      { name: ProductRating.name, schema: productRatingSchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [
    JWTUtils,
    ProductService,
    ProductViewService,
    ProductRatingService,
    PublicUtils,
    ProductLogger,
    LoggerUtils,
  ],
  exports: [ProductService],
})
export class ProductModule {}
