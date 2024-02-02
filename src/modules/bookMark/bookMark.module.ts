import { adminSchema } from '../admin/schemas/admin.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';

import { transports } from 'winston';
import { BookMarkSchema } from './bookMark.schema';
import { BookMarkController } from './bookMark.controller';
import { BookMarkService } from './bookMark.service';
import { userSchema } from '../user/schema/user.schema';
import { productSchema } from '../product/schemas/product.schema';
import { BookMarkLogger } from 'src/logger/bookMark/bookMarkLogger';
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot({ isGlobal: true });
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'bookMarks', schema: BookMarkSchema },
      { name: 'users', schema: userSchema },
      { name: 'products', schema: productSchema },
      { name: 'admins', schema: adminSchema },
    ]),
  ],
  controllers: [BookMarkController],
  providers: [BookMarkService, JWTUtils, BookMarkLogger],
})
export class BookMarkModule {}
