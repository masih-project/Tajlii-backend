import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AdminAuth, UserAuth } from 'src/types/authorization.types';
import { CreateNotificatioDto } from './dto/CreateNotification.dto';
import { NotificationService } from './notification.service';
@WebSocketGateway({
  namespace: 'notification',
})
export class NotificationGateWay implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private notificationService: NotificationService) {}
  handleDisconnect(client: any) {
    // throw new Error("Method not implemented.");
  }
  user: UserAuth | any;
  admin: AdminAuth | any;
  @WebSocketServer()
  server: Server;
  onModuleInit() {
    this.server.on('connection', async (socket) => {
      this.user = await this.notificationService.userAuthGuard(socket.handshake.headers);
      this.admin = await this.notificationService.adminAuthGuard(socket.handshake.headers);
      if (Object.keys(this.user).length > 0) {
        socket.emit('onNotification', await this.notificationService.getNotifications(this.user));
      } else if (Object.keys(this.admin).length > 0) {
        socket.emit('onNotificationByAdmin', await this.notificationService.getNotificationsByAdmin(this.admin));
      }
    });
  }
  handleConnection() {
    console.info('USER CONNECTED: ');
  }

  @SubscribeMessage('newNotification')
  async newNotification(@MessageBody() body: CreateNotificatioDto) {
    await this.notificationService.createNotification(body);
    if (this.admin) {
      const notifications = await this.notificationService.getNotificationsByAdmin(this.admin);
      this.server.emit('onNotificationByAdmin', notifications);
    }
  }
  @SubscribeMessage('newNotificationByAdmin')
  async newNotificationByAdmin(@MessageBody() body: CreateNotificatioDto) {
    await this.notificationService.createNotificationByAdmin(body);
    if (this.user) {
      const notifications = await this.notificationService.getNotifications(this.user);
      this.server.emit('onNotification', notifications);
    }
  }
}
