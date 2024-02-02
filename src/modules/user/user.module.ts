import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from './schema/user.schema';
import { skanetUserSchema } from './schema/skanetUser.schema';
import { UserController } from './user.controller';
import { JWTUtils } from '../../utils/jwt-utils';
import { HashUtils } from 'src/utils/hast-utils';
import { AuthService } from '../Auth/auth.service';
import { OtpUtils } from 'src/utils/otp-utils';
import { EmailUtils } from 'src/utils/email-utils';
import { UserService } from './services/user.service';
import { SmsUtils } from 'src/utils/sm-utils';
import { LoggerUtils } from 'src/utils/logger-utils';
import { cartSchema } from '../cart/cart.schema';
import { productSchema } from '../product/schemas/product.schema';
import { PublicUtils } from 'src/utils/public-utils';
import { networkSchema } from '../network/network.schema';
import { rewardSchema } from '../reward/reward.schema';
import { periodSchema } from '../period/period.schema';
import { adminSchema } from '../admin/schemas/admin.schema';
import { SoapModule } from 'nestjs-soap';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VezaratService } from './services/vezarat.service';
import { TerminateRequestService } from './services/terminate-request.service';
import { TerminateRequest, TerminateRequestSchema } from './schema/terminate-request.schema';
import { rankSchema } from '../rank/rank.schema';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TerminateRequest.name, schema: TerminateRequestSchema },
      { name: 'users', schema: userSchema },
      { name: 'skanetusers', schema: skanetUserSchema },
      { name: 'admins', schema: adminSchema },
      { name: 'carts', schema: cartSchema },
      { name: 'products', schema: productSchema },
      { name: 'networks', schema: networkSchema },
      { name: 'rewards', schema: rewardSchema },
      { name: 'periods', schema: periodSchema },
      { name: 'ranks', schema: rankSchema },
    ]),
    SoapModule.registerAsync({
      clientName: 'VEZARAT_SOAP_CLIENT',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('VEZARAT_SOAP_URL'),
      }),
    }),
    ConfigModule,
    RabbitmqModule,
  ],
  controllers: [UserController],
  providers: [
    AuthService,
    HashUtils,
    JWTUtils,
    OtpUtils,
    EmailUtils,
    UserService,
    SmsUtils,
    LoggerUtils,
    PublicUtils,
    VezaratService,
    TerminateRequestService,
    SmsUtils,
    HashUtils,
  ],
  exports: [UserService, VezaratService, TerminateRequestService],
})
export class UserModule {}
