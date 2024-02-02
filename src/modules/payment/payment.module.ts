import { adminSchema } from '../admin/schemas/admin.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';
import { PublicUtils } from 'src/utils/public-utils';
import { userSchema } from '../user/schema/user.schema';
import { cartSchema } from '../cart/cart.schema';
import { CartSerivce } from '../cart/cart.service';
import { CartModule } from '../cart/cart.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { orderSchema } from '../order/order.schema';
import { transactionSchema } from '../transaction/schemas/transaction.schema';
import { copunSchema } from '../copun/copun.schema';
import { TransactionLogger } from 'src/logger/transaction/transactionLogger';
import { productSchema } from '../product/schemas/product.schema';
import { NetworkService } from '../network/network.service';
import { rewardSchema } from '../reward/reward.schema';
import { networkSchema } from '../network/network.schema';
import { rankSchema } from '../rank/rank.schema';
import { periodSchema } from '../period/period.schema';
import { ashantionSchema } from '../ashantion/ashantion.schema';
import { ConfigModule } from '@nestjs/config';
import { SmsUtils } from '@$/utils/sm-utils';
import { TransactionModule } from '../transaction/transaction.module';
import { SamanGatewayService } from './services/saman-gateway.service';
import { UserModule } from '../user/user.module';
import { SettingModule } from '../settings/setting.module';
import { CouponService } from '../copun/copun.service';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { InventoryHistoriesSchema } from '../inventoryHistories/inventoryHistories.schema';
import { InventorySchema } from '../inventory/inventory.schema';
import { CategoryModule } from '../category/category.module';
import { OrderModule } from '../order/order.module';

ConfigModule.forRoot({ isGlobal: true });
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'admins', schema: adminSchema },
      { name: 'users', schema: userSchema },
      { name: 'copuns', schema: copunSchema },
      { name: 'orders', schema: orderSchema },
      { name: 'transactions', schema: transactionSchema },
      { name: 'copuns', schema: copunSchema },
      { name: 'products', schema: productSchema },
      { name: 'rewards', schema: rewardSchema },
      { name: 'networks', schema: networkSchema },
      { name: 'ranks', schema: rankSchema },
      { name: 'periods', schema: periodSchema },
      { name: 'ashantions', schema: ashantionSchema },
      { name: 'carts', schema: cartSchema },
      { name: 'inventories', schema: InventorySchema },
      { name: 'inventoryHistories', schema: InventoryHistoriesSchema },
    ]),
    CartModule,
    TransactionModule,
    ConfigModule,
    UserModule,
    SettingModule,
    RabbitmqModule,
    OrderModule,
  ],
  controllers: [PaymentController],
  providers: [
    JWTUtils,
    PublicUtils,
    PaymentService,
    TransactionLogger,
    NetworkService,
    CartSerivce,
    SmsUtils,
    SamanGatewayService,
    CouponService,
  ],
})
export class PaymentModule {}
