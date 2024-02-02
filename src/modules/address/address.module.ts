import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';

import { transports } from 'winston';
import { userSchema } from '../user/schema/user.schema';
import { AddressSchema } from './address.schema';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { AddressLogger } from 'src/logger/address/addressLogger';
import { ConfigModule } from '@nestjs/config';
ConfigModule.forRoot({ isGlobal: true });
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'addresses', schema: AddressSchema },
      { name: 'users', schema: userSchema },
    ]),
  ],
  controllers: [AddressController],
  providers: [JWTUtils, AddressService, AddressLogger],
})
export class AddressModule {}
