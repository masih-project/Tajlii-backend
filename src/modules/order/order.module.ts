import { rankSchema } from './../rank/rank.schema';
import { settingSchema } from './../settings/setting.schema';
import { adminSchema } from '../admin/schemas/admin.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';
import { PublicUtils } from 'src/utils/public-utils';
import { DepotLogger } from 'src/logger/depot/depotLogger';
import { OrderController } from './order.controller';
import { userSchema } from '../user/schema/user.schema';
import { OrderService } from './order.service';
import { cartSchema } from '../cart/cart.schema';
import { CartSerivce } from '../cart/cart.service';
import { orderSchema } from './order.schema';
import { copunSchema } from '../copun/copun.schema';
import { productSchema } from '../product/schemas/product.schema';
import { notificationSchema } from '../notification/notification.schema';
import { NotificationModule } from '../notification/notification.module';
import { transactionSchema } from '../transaction/schemas/transaction.schema';
import { ashantionSchema } from '../ashantion/ashantion.schema';
import { ConfigModule } from '@nestjs/config';
import { NetworkService } from '../network/network.service';
import { periodSchema } from '../period/period.schema';
import { rewardSchema } from '../reward/reward.schema';
import { networkSchema } from '../network/network.schema';
import { UserModule } from '../user/user.module';
import { SettingModule } from '../settings/setting.module';
import { AddressSchema } from '../address/address.schema';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { CategoryModule } from '../category/category.module';

ConfigModule.forRoot({ isGlobal: true });
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'admins', schema: adminSchema },
      { name: 'users', schema: userSchema },
      { name: 'orders', schema: orderSchema },
      { name: 'carts', schema: cartSchema },
      { name: 'products', schema: productSchema },
      { name: 'copuns', schema: copunSchema },
      { name: 'transactions', schema: transactionSchema },
      { name: 'notifications', schema: notificationSchema },
      { name: 'periods', schema: periodSchema },
      { name: 'rewards', schema: rewardSchema },
      { name: 'networks', schema: networkSchema },
      { name: 'ranks', schema: rankSchema },
      { name: 'addresses', schema: AddressSchema },
      { name: 'settings', schema: settingSchema },
      {
        name: 'ashantions',
        schema: ashantionSchema,
      },
    ]),
    UserModule,
    NotificationModule,
    SettingModule,
    RabbitmqModule,
    CategoryModule,
  ],
  controllers: [OrderController],
  providers: [
    JWTUtils,
    PublicUtils,
    DepotLogger,
    OrderService,
    CartSerivce,
    NetworkService,
    // NotificationGateWay,
    // NotificationService
  ],
  exports: [OrderService],
})
export class OrderModule {}
