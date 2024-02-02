import { Injectable } from '@nestjs/common';
import { ProductDocument } from '@$/modules/product/schemas/product.schema';
import { messageTicketDocument } from 'src/modules/ticket/messageTicket.schema';
import { ticketDocument } from 'src/modules/ticket/ticket.shcema';
import { AdminAuth, UserAuth } from 'src/types/authorization.types';

@Injectable()
export class TicketLogger {
  createTicketByAdmin(ticket: ticketDocument, admin: string) {
    const template = `
        <div>
              تیکت با شناسه
              ${ticket.ticket_code}
              توسط
            ${admin}
            ایجاد شد
        </div>
        `;
    return template;
  }
  createTicket(ticket: ticketDocument, user: UserAuth) {
    const template = `
        <div>
              تیکت با شناسه
              ${ticket.ticket_code}
              توسط
            ${user.username}
            ایجاد شد
        </div>
        `;
    return template;
  }
  createTicketMessage(ticket: messageTicketDocument, user: UserAuth) {
    const template = `
        <div>
              تیکت با شناسه
              ${ticket._id}
              توسط
            ${user.username}
            جواب داده شده است
        </div>
        `;
    return template;
  }
  createTicketMessageByAdmin(ticket: messageTicketDocument, admin: string) {
    const template = `
        <div>
              تیکت با شناسه
              ${ticket._id}
              توسط
            ${admin}
             جواب داده شده است
        </div>
        `;
    return template;
  }
  updateTicketMessageByAdmin(ticket: ticketDocument, admin: string) {
    const template = `
        <div>
              تیکت با شناسه
              ${ticket._id}
              توسط
            ${admin}
            ویرایش شد
        </div>
        `;
    return template;
  }
}
