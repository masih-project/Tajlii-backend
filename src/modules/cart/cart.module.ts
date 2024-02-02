import { userSchema } from './../user/schema/user.schema';
import { cartSchema } from './cart.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';
import { CartController } from './cart.controller';
import { CartSerivce } from './cart.service';
import { productSchema } from '../product/schemas/product.schema';
import { orderSchema } from '../order/order.schema';
import { settingSchema } from '../settings/setting.schema';
import { ashantionSchema } from '../ashantion/ashantion.schema';
import { ConfigModule } from '@nestjs/config';
import { SettingModule } from '../settings/setting.module';
ConfigModule.forRoot({ isGlobal: true });
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'carts', schema: cartSchema },
      { name: 'products', schema: productSchema },
      { name: 'users', schema: userSchema },
      { name: 'orders', schema: orderSchema },
      {
        name: 'ashantions',
        schema: ashantionSchema,
      },
    ]),
    SettingModule,
  ],
  controllers: [CartController],
  providers: [CartSerivce, JWTUtils],
  exports: [CartSerivce],
})
export class CartModule {}
