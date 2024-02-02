import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { userSchema } from '../user/schema/user.schema';
import { AuthService } from './auth.service';
import { HashUtils } from '../../utils/hast-utils';
import { JWTUtils } from '../../utils/jwt-utils';
import { OtpUtils } from '../../utils/otp-utils';
import { EmailUtils } from '../../utils/email-utils';
import { SmsUtils } from 'src/utils/sm-utils';
import { LoggerUtils } from 'src/utils/logger-utils';
import { ConfigModule } from '@nestjs/config';
import { cartSchema } from '../cart/cart.schema';
import { productSchema } from '../product/schemas/product.schema';
import { adminSchema } from '../admin/schemas/admin.schema';
import { CartModule } from '../cart/cart.module';
import { UserModule } from '../user/user.module';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'admins', schema: adminSchema },
      { name: 'users', schema: userSchema },
      { name: 'carts', schema: cartSchema },
      { name: 'products', schema: productSchema },
    ]),
    UserModule,
    CartModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitmqModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, HashUtils, JWTUtils, OtpUtils, EmailUtils, SmsUtils, LoggerUtils],
})
export class AuthModule {}
