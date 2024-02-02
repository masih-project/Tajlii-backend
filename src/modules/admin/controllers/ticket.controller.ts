import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { TicketService } from '@$/modules/ticket/ticket.service';
import { createTicketByAdmin } from '@$/modules/ticket/dto/createTicketByAdmin.dto';
import { GetAdmin } from '@$/common/decorators/get-admin.decorator';
import { AdminDocument } from '../schemas/admin.schema';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { CreateMessageTicketByAdmin } from '@$/modules/ticket/dto/createMessageTicketByAdmin.dto';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { QueryTicketByAdmin } from '@$/modules/ticket/dto/queryTicketByAdmin.dto';
import { UpdateTicketByAdminDto } from '@$/modules/ticket/dto/update-ticket.dto';
import { UpdateMessageTicketByAdmin } from '@$/modules/ticket/dto/update-ticket-message.dto';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/ticket')
@Controller('admin/ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('/')
  @HasPermissions('Create.Ticket')
  async createTicketByAdmin(@GetAdmin() admin: AdminDocument, @Body() body: createTicketByAdmin) {
    return this.ticketService.createTicketByAdmin(body, admin);
  }

  @Patch('/:id')
  @HasPermissions('Update.Ticket')
  async updateTicketByAdmin(
    @GetAdmin() admin: AdminDocument,
    @Body() body: UpdateTicketByAdminDto,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.ticketService.updateTicketByAdmin(id, body);
  }

  @Patch('/:ticketId/message/:messageId')
  @HasPermissions('Update.Ticket')
  async updateMessageTicketByAdmin(
    @GetAdmin() admin: AdminDocument,
    @Body() body: UpdateMessageTicketByAdmin,
    @Param('ticketId', ParseObjectIdPipe) ticketId: string,
    @Param('messageId', ParseObjectIdPipe) messageId: string,
  ) {
    return this.ticketService.updateMessageTicketByAdmin(ticketId, messageId, body);
  }

  @Get('/:id/message')
  @HasPermissions('Read.Ticket')
  async getTicketMessageByAdmin(@GetAdmin() admin: AdminDocument, @Param('id', ParseObjectIdPipe) id: string) {
    return this.ticketService.getTicketMessageByAdmin(id, admin._id);
  }

  @Post('/:id/message')
  @HasPermissions('Create.Ticket')
  async createMessageTicketByAdmin(
    @GetAdmin() admin: AdminDocument,
    @Body() body: CreateMessageTicketByAdmin,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.ticketService.createMessageTicketByAdmin(id, body, admin);
  }

  @Get('/')
  @HasPermissions('Read.Ticket')
  async getTicketsByAdmin(@Query() query: QueryTicketByAdmin) {
    return this.ticketService.getTicketsByAdmin(query);
  }

  // @Put('/:ticket_id/message/:message_id')
  // @HasPermissions('Update.Ticket')
  // async updateTicketMessageByAdmin(
  //   @GetAdmin() admin: AdminDocument,
  //   @Body() body: UpdateTicketMessageByAdmin,
  //   @Param('ticket_id', ParseObjectIdPipe) ticket_id: string,
  //   @Param('message_id', ParseObjectIdPipe) message_id: string,
  // ) {
  //   return this.ticketService.updateTicketMessageByAdmin(body, ticket_id, message_id, admin);
  // }

  // @Get('/excel')
  // @HasPermissions('Read.Ticket')
  // async generateTransactionExcel(@Res() res: Response) {
  //   const transactions = await this.transactionService.generateTransactionExcel();
  //   const workbook = new excel.Workbook();
  //   const worksheet = workbook.addWorksheet('Transactions');
  //   worksheet.columns = [
  //     { header: 'code transaction', key: 'code_transaction', width: 5 },
  //     { header: 'Name', key: 'user.first_name' + 'user.last_name', width: 5 },
  //     { header: 'refID', key: 'refID', width: 5 },
  //     { header: 'cardHash', key: 'cardHash', width: 5 },
  //     { header: 'amount', key: 'amount', width: 5 },
  //     { header: 'status', key: 'status', width: 5 },
  //     { header: 'transaction code', key: 'transactionـcode', width: 5 },
  //   ];

  //   worksheet.addRows(transactions);
  //   res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  //   res.setHeader('Content-Disposition', 'attachment; filename=' + 'transactions.xlsx');
  //   return workbook.xlsx.write(res).then(() => {
  //     res.status(200).end();
  //   });
  // }
}
