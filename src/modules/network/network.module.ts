import { orderSchema } from './../order/order.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';
import { adminSchema } from '../admin/schemas/admin.schema';
import { userSchema } from '../user/schema/user.schema';
import { NetworkController } from './network.controller';
import { networkSchema } from './network.schema';
import { NetworkService } from './network.service';
import { rewardSchema } from '../reward/reward.schema';
import { rankSchema } from '../rank/rank.schema';
import { PublicUtils } from 'src/utils/public-utils';
import { periodSchema } from '../period/period.schema';
import { PeriodModule } from '../period/period.module';
import { UserModule } from '../user/user.module';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { RabbitPublisherService } from '../rabbitmq/rabbit-publisher.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'admins', schema: adminSchema },
      { name: 'users', schema: userSchema },
      { name: 'networks', schema: networkSchema },
      { name: 'orders', schema: orderSchema },
      { name: 'rewards', schema: rewardSchema },
      { name: 'ranks', schema: rankSchema },
      { name: 'periods', schema: periodSchema },
    ]),
    UserModule,
    PeriodModule,
    RabbitmqModule,
  ],
  controllers: [NetworkController],
  providers: [NetworkService, JWTUtils, PublicUtils],
  exports: [NetworkService],
})
export class NetworkModule {}
