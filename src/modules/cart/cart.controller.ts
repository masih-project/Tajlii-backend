import { Body, Controller, Delete, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CardUserAuthGuard } from 'src/guard/cardUserAuth.guard';
import { RequestUserWithAuth } from 'src/types/authorization.types';
import { CartSerivce } from './cart.service';
import { CreateCart } from './dto/createCart.dto';
import { DeleteCartDto } from './dto/deleteCart.dto';
import { GetUser } from '@$/common/decorators/get-user.decorator';
import { UserDocument } from '../user/schema/user.schema';

@ApiBearerAuth('access-token')
@UseGuards(CardUserAuthGuard)
@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartSerivce) {}

  @Post('/')
  async createCart(@Res() res: Response, @Body() body: CreateCart, @Req() request: RequestUserWithAuth) {
    const user = request.user;
    let { session_id } = request.cookies;
    if (!session_id) {
      const headers: any = res.getHeaders();
      const cookies: any = headers['set-cookie'];
      const cookie = cookies.split(';');
      const [, session_id_value] = cookie[0].split('session_id=');
      session_id = session_id_value;
    }
    const cart = await this.cartService.createCart(body, user, session_id);
    return res.json({ success: true, data: cart });
  }

  @Delete('/')
  async deleteCart(@Body() body: DeleteCartDto, @Req() req: RequestUserWithAuth) {
    const user = req.user;
    const { session_id } = req.cookies;
    return this.cartService.deleteCart(body.product_id, user, session_id);
  }

  @Delete('/all')
  async deleteAllCarts(@Req() req: RequestUserWithAuth , @GetUser() user:UserDocument) {
    const { session_id } = req.cookies;
    return await this.cartService.deleteAllCarts(user, session_id);
  }

  @Get('/')
  async getCart(@Res() res: Response, @Req() req: RequestUserWithAuth) {
    const user = req.user;
    let { session_id } = req.cookies;
    if (!session_id) {
      const headers: any = res.getHeaders();
      const cookies: any = headers['set-cookie'];
      const cookie = cookies.split(';');
      const [, session_id_value] = cookie[0].split('session_id=');
      session_id = session_id_value;
    }
    const carts = await this.cartService.getCarts(user, session_id);
    return res.json({ success: true, data: carts });
  }
}
