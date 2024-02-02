import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserAuthGuard } from 'src/guard/userAuth.guard';
import { UserAuth } from 'src/types/authorization.types';
import { CreateMessageTicket } from './dto/createMessageTicket.dto';
import { CreateTicket } from './dto/createTicket.dto';
import { QueryTicket } from './dto/queryTicket.dto';
import { TicketService } from './ticket.service';
import { GetUser } from '@$/common/decorators/get-user.decorator';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';

@ApiBearerAuth('access-token')
@UseGuards(UserAuthGuard)
@ApiTags('Ticket')
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('/')
  async createTicket(@GetUser() user: UserAuth, @Body() body: CreateTicket) {
    return this.ticketService.createTicket(body, user);
  }

  @Post('/:id/message')
  async createMessageTicket(
    @GetUser() user: UserAuth,
    @Body() body: CreateMessageTicket,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.ticketService.createMessageTicket(id, body, user);
  }

  @Get('/')
  async getTickets(@GetUser() user: UserAuth, @Query() query: QueryTicket) {
    return this.ticketService.getTickets(user, query);
  }

  @Get('/:id/message')
  async getMessageTickets(@GetUser() user: UserAuth, @Param('id') id: string) {
    return this.ticketService.getMessageTickets(id, user);
  }
}
