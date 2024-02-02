import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';
import { userSchema } from '../user/schema/user.schema';
import { SettingController } from './setting.controller';
import { settingSchema } from './setting.schema';
import { SettingService } from './setting.service';
import { adminSchema } from '../admin/schemas/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'settings', schema: settingSchema },
      { name: 'users', schema: userSchema },
      { name: 'admins', schema: adminSchema },
    ]),
  ],
  controllers: [SettingController],
  providers: [SettingService, JWTUtils],
  exports: [SettingService],
})
export class SettingModule {}
