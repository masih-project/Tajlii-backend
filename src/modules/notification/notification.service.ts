import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateNotificatioDto } from './dto/CreateNotification.dto';
import { JWTUtils } from 'src/utils/jwt-utils';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../user/user.interface';
import { AdminAuth, UserAuth } from 'src/types/authorization.types';

import { WsException } from '@nestjs/websockets';
import { Admin } from '../admin/schemas/admin.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('notifications') private notificationModel: Model<Notification>,
    @InjectModel('users') private userModel: Model<User>,
    @InjectModel('admins') private adminModel: Model<Admin>,
    private jwtUtils: JWTUtils,
  ) {}
  async getNotifications(user: UserAuth) {
    const notifications = await this.notificationModel.find({
      receivers: {
        $in: [user._id.toString()],
      },
    });
    return notifications;
  }
  async getNotificationsByAdmin(admin: AdminAuth) {
    const notifications = await this.notificationModel.find({
      receivers: {
        $in: [admin._id],
      },
    });
    return notifications;
  }
  async createNotification(body: CreateNotificatioDto) {
    await this.notificationModel.create({
      ...body,
    });
  }
  async userAuthGuard(headers: any) {
    try {
      const authHeader = headers.authorization;
      if (!authHeader) {
        return new WsException('unauthorized');
      }
      const token = authHeader.split(' ')[1];
      const { _id } = (await this.jwtUtils.verifyToken(token)) as JwtPayload;
      const user = await this.userModel.findOne({ _id });
      return user;
    } catch (error) {
      return new WsException('unauthorized');
    }
  }
  async adminAuthGuard(headers: any) {
    const authHeader = headers.authorization;
    if (!authHeader) {
      return;
    }
    const token = authHeader.split(' ')[1];
    const { _id } = (await this.jwtUtils.verifyToken(token)) as JwtPayload;
    const admin = await this.adminModel.findOne({ _id });
    return admin;
  }
  async createNotificationByAdmin(body: CreateNotificatioDto) {
    await this.notificationModel.create({
      ...body,
    });
  }
}
