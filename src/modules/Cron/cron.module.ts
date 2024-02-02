import { networkSchema } from './../network/network.schema';
import { adminSchema } from '../admin/schemas/admin.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicUtils } from 'src/utils/public-utils';

import { transports } from 'winston';
import { userSchema } from '../user/schema/user.schema';
import { CronController } from './cron.controller';
import { orderSchema } from '../order/order.schema';
import { CronService } from './cron.service';
import { rewardSchema } from '../reward/reward.schema';
import { rankSchema } from '../rank/rank.schema';
import { periodSchema } from '../period/period.schema';
import { transactionSchema } from '../transaction/schemas/transaction.schema';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([
      { name: 'users', schema: userSchema },
      { name: 'admins', schema: adminSchema },
      { name: 'orders', schema: orderSchema },
      { name: 'networks', schema: networkSchema },
      { name: 'rewards', schema: rewardSchema },
      { name: 'ranks', schema: rankSchema },
      { name: 'periods', schema: periodSchema },
      { name: 'transactions', schema: transactionSchema },
    ]),
  ],
  controllers: [CronController],
  providers: [CronService, PublicUtils],
})
export class CronModule {}
