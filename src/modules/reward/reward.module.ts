import { settingSchema } from './../settings/setting.schema';
import { networkSchema } from './../network/network.schema';
import { userSchema } from './../user/schema/user.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';
import { RewaredController } from './reware.controller';
import { RewardService } from './reward.service';
import { rewardSchema } from './reward.schema';
import { PublicUtils } from 'src/utils/public-utils';
import { periodSchema } from '../period/period.schema';
import { orderSchema } from '../order/order.schema';
import { adminSchema } from '../admin/schemas/admin.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'users', schema: userSchema },
      { name: 'admins', schema: adminSchema },
      { name: 'rewards', schema: rewardSchema },
      { name: 'periods', schema: periodSchema },
      { name: 'orders', schema: orderSchema },
      { name: 'networks', schema: networkSchema },
      { name: 'settings', schema: settingSchema },
    ]),
    UserModule,
  ],
  controllers: [RewaredController],
  providers: [RewardService, JWTUtils, PublicUtils],
  exports: [RewardService],
})
export class RewardModule {}
