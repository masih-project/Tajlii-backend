import { UpdateOrder } from './dto/updateOrder.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserAuthGuard } from 'src/guard/userAuth.guard';
import { ApplyCopunOrderDto } from './dto/applyCopunOrder.dto';
import { CreateOrderDto } from './dto/createOrder.dto';
import { QueryOrderDto } from './dto/queryOrder.dto';
import { OrderService } from './order.service';
import { GetUser } from '@$/common/decorators/get-user.decorator';
import { UserAuth } from '@$/types/authorization.types';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';

@ApiBearerAuth('access-token')
@UseGuards(UserAuthGuard)
@ApiTags('Order')
@Controller('Order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/')
  async createOrder(@GetUser() user: UserAuth, @Body() body: CreateOrderDto) {
    const order_id = await this.orderService.createOrder(body, user);
    return { order_id };
  }

  @Get('/')
  async getOrders(@GetUser() user: UserAuth, @Query() query: QueryOrderDto) {
    return this.orderService.getOrders(query, user);
  }

  @Get('/:id')
  async getOrder(@GetUser() user: UserAuth, @Param('id', ParseObjectIdPipe) id: string) {
    return this.orderService.getOrder(id, user);
  }

  @Post('/applyCopun')
  async applyCopunOrder(@Body() body: ApplyCopunOrderDto) {
    await this.orderService.applayCopunOrder(body);
  }

  @Delete('/:id/deleteCopun')
  async deleteCopunOrder(@Param('id', ParseObjectIdPipe) id: string) {
    return this.orderService.deleteCopunOrder(id);
  }

  @Put('/:id')
  async updateOrder(@GetUser() user: UserAuth, @Body() body: UpdateOrder, @Param('id', ParseObjectIdPipe) id: string) {
    return this.orderService.updateOrder(id, body, user);
  }
}
