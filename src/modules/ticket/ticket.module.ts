import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketLogger } from 'src/logger/ticket/ticketLogget';
import { JWTUtils } from 'src/utils/jwt-utils';
import { PublicUtils } from 'src/utils/public-utils';
import { transports } from 'winston';
import { NotificationModule } from '../notification/notification.module';
import { notificationSchema } from '../notification/notification.schema';
import { userSchema } from '../user/schema/user.schema';
import { messageTicketSchema } from './messageTicket.schema';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { ticketSchema } from './ticket.shcema';
import { adminSchema } from '../admin/schemas/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'tickets', schema: ticketSchema },
      { name: 'users', schema: userSchema },
      { name: 'admins', schema: adminSchema },
      // { name: 'messageTickets', schema: messageTicketSchema },
      { name: 'notifications', schema: notificationSchema },
    ]),
    NotificationModule,
  ],
  controllers: [TicketController],
  providers: [TicketService, JWTUtils, TicketLogger, PublicUtils],
  exports: [TicketService],
})
export class TicketModule {}
