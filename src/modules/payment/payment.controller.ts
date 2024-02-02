import { UserAuth } from './../../types/authorization.types';
import { Body, Controller, Ip, Post, Render, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserAuthGuard } from 'src/guard/userAuth.guard';
import { InitSamanPaymentDto, PaymentGatewayDto } from './dto/paymentGateway.dto';
import { VerifyPaymentDto } from './dto/verifyPayment.dto';
import { PaymentService } from './payment.service';
import { GetUser } from '@$/common/decorators/get-user.decorator';
import { IgnoreResponseInterceptor } from '@$/common/decorators/ignore-response-interceptor.decorator';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth('access-token')
@ApiTags('Payment')
@Controller('/Payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(UserAuthGuard)
  @Post('/saman/init')
  async initSamanPayment(@GetUser() user: UserAuth, @Body() body: InitSamanPaymentDto, @Ip() ip: string) {
    const result = await this.paymentService.initSamanPayment(body, user, ip);
    return { url: result };
  }

  @IgnoreResponseInterceptor()
  @UseInterceptors(AnyFilesInterceptor())
  @Post('saman/callback')
  @Render('payment/callback')
  async samanCallback(@Body() body: any) {
    console.info('##################', body);
    const url = await this.paymentService.receiveSamanCallbackAndVerify(body);
    return { url };
  }

  // @UseGuards(UserAuthGuard)
  // @Post('/saman')
  // async PaymentGatewaySaman(@GetUser() user: UserAuth, @Body() body: PaymentGatewayDto) {
  //   const url = await this.paymentService.PaymentGatewaySaman(body, user);
  //   return { url };
  // }

  @UseGuards(UserAuthGuard)
  @Post('/zarinpal')
  async PaymentGateway(@GetUser() user: UserAuth, @Body() body: PaymentGatewayDto) {
    const url = await this.paymentService.PaymentGateway(body, user);
    return { url };
  }

  @UseGuards(UserAuthGuard)
  @Post('/zarinpal/verify')
  async VerifyPaymentGateway(@GetUser() user: UserAuth, @Body() body: VerifyPaymentDto) {
    const transaction_id = await this.paymentService.VerifyPaymentGateway(body, user);
    return { transaction_id };
  }
}
