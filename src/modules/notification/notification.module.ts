import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';
import { adminSchema } from '../admin/schemas/admin.schema';
import { userSchema } from '../user/schema/user.schema';
import { NotificationGateWay } from './notification.gateway';
import { notificationSchema } from './notification.schema';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'admins', schema: adminSchema },
      { name: 'users', schema: userSchema },
      { name: 'notifications', schema: notificationSchema },
    ]),
  ],
  controllers: [],
  providers: [NotificationGateWay, NotificationService, JWTUtils],
  exports: [NotificationGateWay, NotificationService, NotificationModule],
})
export class NotificationModule {}
