import { BrandController } from './brandController';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { brandSchema } from './brand.schema';
import { JWTUtils } from 'src/utils/jwt-utils';
import { BrandService } from './brand.service';
import { PublicUtils } from 'src/utils/public-utils';

import { transports } from 'winston';
import { BrandLogger } from 'src/logger/brand/brandLogger';
import { adminSchema } from '../admin/schemas/admin.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'brands', schema: brandSchema },
      { name: 'admins', schema: adminSchema },
    ]),
  ],
  controllers: [BrandController],
  providers: [BrandService, JWTUtils, PublicUtils, BrandLogger],
  exports: [BrandService],
})
export class BrandModule {}
