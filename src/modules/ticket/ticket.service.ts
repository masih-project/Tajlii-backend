import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAuth } from 'src/types/authorization.types';
import { statusTicket } from 'src/types/status.types';
import { CreateMessageTicket } from './dto/createMessageTicket.dto';
import { CreateTicket } from './dto/createTicket.dto';
import { createTicketByAdmin } from './dto/createTicketByAdmin.dto';
import { Ticket } from './ticket.shcema';
import { CreateMessageTicketByAdmin } from './dto/createMessageTicketByAdmin.dto';
import { TicketLogger } from 'src/logger/ticket/ticketLogget';
import { PublicUtils } from 'src/utils/public-utils';
import { QueryTicket } from './dto/queryTicket.dto';
import { QueryTicketByAdmin } from './dto/queryTicketByAdmin.dto';
import { NotificationGateWay } from '../notification/notification.gateway';
import { Admin, AdminDocument } from '../admin/schemas/admin.schema';
import { ObjectId } from 'mongodb';
import { UpdateTicketByAdminDto } from './dto/update-ticket.dto';
import { UpdateMessageTicketByAdmin } from './dto/update-ticket-message.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel('tickets') private ticketModel: Model<Ticket>,
    @InjectModel('admins') private adminModel: Model<Admin>,
    // @InjectModel('messageTickets') private messageTicketModel: Model<MessageTicket>,
    private ticketLogger: TicketLogger,
    private publicUtils: PublicUtils,
    private notificationGateWay: NotificationGateWay,
  ) {}
  async createTicket(body: CreateTicket, user: UserAuth): Promise<any> {
    const ticket_code = await this.publicUtils.generateRandomNumber(6);
    const new_ticket = await this.ticketModel.create({
      ...body,
      sender_user: new ObjectId(user._id),
      status: statusTicket.OPEN,
      department: new ObjectId(body.department),
      ticket_code,
      messages: {
        text: body.message,
        files: body.files,
        sender_user: new ObjectId(user._id),
      },
    });
    // let admins: any = await this.adminModel.find({}, { _id: 1 });
    // admins = admins.map((admin) => admin._id);
    // await this.notificationGateWay.newNotification({
    //   message: `یک تیکت برای شما ارسال شده است`,
    //   receivers: admins,
    // });
    return new_ticket;
  }
  async createMessageTicket(id: string, body: CreateMessageTicket, user: UserAuth): Promise<any> {
    const ticket = await this.ticketModel.findOne({ _id: id });
    if (!ticket) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    await this.ticketModel.updateOne(
      { _id: ticket._id },
      {
        status: statusTicket.ANSWERED_USER,
        $push: {
          messages: {
            text: body.message,
            files: body.files,
            sender_user: new ObjectId(user._id),
          },
        },
      },
    );
    return await this.ticketModel.findOne({ _id: ticket._id });

    // let admins: any = await this.adminModel.find({}, { _id: 1 });
    // admins = admins.map((admin) => admin._id);
    // await this.notificationGateWay.newNotification({
    //   message: `جواب تیکت شماره ${ticket.ticket_code} داده شده است`,
    //   receivers: admins,
    // });
    // return result;
  }
  async createTicketByAdmin(body: createTicketByAdmin, admin: AdminDocument): Promise<any> {
    const ticket_code = await await this.publicUtils.generateRandomNumber(6);
    const new_ticket = await this.ticketModel.create({
      ...body,
      sender_admin: new ObjectId(admin._id),
      receiver_user: new ObjectId(body.receiver_user),
      department: new ObjectId(body.department),
      status: statusTicket.OPEN,
      messages: {
        text: body.message,
        files: body.files,
        sender_admin: new ObjectId(admin._id),
      },
      ticket_code,
    });
    // await this.notificationGateWay.newNotificationByAdmin({
    //   message: `یک تیکت برای شما ارسال شده است`,
    //   receivers: [body.receiver_user],
    // });
    return new_ticket;
  }
  async createMessageTicketByAdmin(id: string, body: CreateMessageTicketByAdmin, admin: AdminDocument): Promise<any> {
    const ticket = await this.ticketModel.findOne({ _id: id });
    if (!ticket) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    await this.ticketModel.updateOne(
      { _id: ticket._id },
      {
        status: statusTicket.ANSWERED_ADMIN,
        $push: {
          messages: {
            text: body.message,
            files: body.files,
            sender_admin: new ObjectId(admin._id),
          },
        },
      },
    );
    return await this.ticketModel.findOne({ _id: ticket._id });
    // await this.notificationGateWay.newNotificationByAdmin({
    //   message: `یک تیکت برای شما ارسال شده است`,
    //   receivers: ticket.sender_user ? [ticket.sender_user.toString()] : [ticket.receiver_user.toString()],
    // });
  }
  async getTicketsByAdmin(query: QueryTicketByAdmin): Promise<any> {
    let { limit = 20, skip = 1, keyword = '', order_by, order_type, status } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(skip - 1);
    const sort = {};
    sort[order_by] = order_type === 'ASC' ? 1 : -1;
    const filter = {
      ...(status !== undefined && {
        status,
      }),
    };
    const items = await this.ticketModel
      .find(
        {
          $or: [
            {
              ticket_code: {
                $regex: new RegExp(keyword as string),
                $options: 'i',
              },
              subject: {
                $regex: new RegExp(keyword as string),
                $options: 'i',
              },
              ...filter,
            },
          ],
        },
        { messages: 0 },
      )
      .populate('department')
      .populate('sender_user', 'first_name last_name email')
      .populate('receiver_user', 'first_name last_name email')
      .limit(limit)
      .skip(skip)
      .sort(sort);
    const count = await this.ticketModel
      .find(
        {
          $or: [
            {
              ticket_code: {
                $regex: new RegExp(keyword as string),
                $options: 'i',
              },
              subject: {
                $regex: new RegExp(keyword as string),
                $options: 'i',
              },
              ...filter,
            },
          ],
        },
        { messages: 0 },
      )
      .count();
    return {
      items,
      count,
    };
  }
  async getTickets(user: UserAuth, query: QueryTicket): Promise<any> {
    let { limit = 20, skip = 1, order_by, order_type, type } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(skip - 1);
    const sort = {};
    sort[order_by] = order_type === 'ASC' ? 1 : -1;
    const filter = {
      ...(type !== undefined && {
        status: type,
      }),
    };
    const items = await this.ticketModel
      .find(
        {
          $or: [
            {
              sender_user: new ObjectId(user._id),
              ...filter,
            },
            {
              receiver_user: new ObjectId(user._id),
              ...filter,
            },
          ],
        },
        { sender_admin: 0, messages: 0 },
      )
      .populate('department')
      .populate('sender_user', 'first_name last_name email')
      .populate('receiver_user', 'first_name last_name email')
      .limit(limit)
      .skip(skip)
      .sort(sort);
    const count = await this.ticketModel
      .find({
        $or: [
          {
            sender_user: new ObjectId(user._id),
          },
          {
            receiver_user: new ObjectId(user._id),
          },
        ],
      })
      .count();
    return {
      items,
      count,
    };
  }
  async getMessageTickets(id: string, user: UserAuth): Promise<any> {
    const ticket = await this.ticketModel
      .findOne({
        $or: [
          {
            _id: id,
            sender_user: new ObjectId(user._id),
          },
          {
            _id: id,
            receiver_user: new ObjectId(user._id),
          },
        ],
      })
      .populate('department')
      .populate('sender_user', 'first_name last_name email')
      .populate('receiver_user', 'first_name last_name email');
    if (!ticket) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return ticket;
  }
  async getTicketMessageByAdmin(id: string, adminId: string | ObjectId): Promise<any> {
    const ticket = await this.ticketModel
      .findOne(
        {
          $or: [
            {
              _id: id,
              sender_admin: new ObjectId(adminId),
            },
            {
              _id: id,
            },
          ],
        },
        {},
      )
      .populate('department')
      .populate('sender_user', 'first_name last_name email')
      .populate('receiver_user', 'first_name last_name email');
    if (!ticket) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return ticket;
  }
  async updateMessageTicketByAdmin(
    ticketId: string,
    messageId: string,
    body: UpdateMessageTicketByAdmin,
  ): Promise<any> {
    const ticket = await this.ticketModel.findOne({ _id: ticketId });
    if (!ticket) {
      throw new NotFoundException();
    }
    await this.ticketModel.updateOne(
      { _id: ticketId, 'messages._id': new ObjectId(messageId) },
      {
        $set: { 'messages.$.text': body.message, 'messages.$.files': body.files },
      },
    );
    return await this.ticketModel.findOne({ _id: ticketId });
  }

  async updateTicketByAdmin(id: string, body: UpdateTicketByAdminDto) {
    const ticket = await this.ticketModel.findOne({ _id: id });
    if (!ticket) {
      throw new NotFoundException();
    }
    return await this.ticketModel.updateOne(
      { _id: ticket._id },
      {
        ...body,
      },
    );
  }
}
