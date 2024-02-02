import { adminSchema } from '../admin/schemas/admin.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';
import { PublicUtils } from 'src/utils/public-utils';
import { CopunController } from './copun.controller';
import { userSchema } from '../user/schema/user.schema';
import { copunSchema } from './copun.schema';
import { CouponService } from './copun.service';
import { ConfigModule } from '@nestjs/config';
import { orderSchema } from '../order/order.schema';
ConfigModule.forRoot({ isGlobal: true });
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'users', schema: userSchema },
      { name: 'admins', schema: adminSchema },
      { name: 'copuns', schema: copunSchema },
      { name: 'orders', schema: orderSchema },
    ]),
  ],
  controllers: [CopunController],
  providers: [JWTUtils, PublicUtils, CouponService],
  exports: [CouponService],
})
export class CopunModule {}
