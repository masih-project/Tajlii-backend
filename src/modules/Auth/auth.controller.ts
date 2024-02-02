import {
  Controller,
  Post,
  Res,
  HttpStatus,
  Body,
  Req,
  BadRequestException,
  MethodNotAllowedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import {
  RegisterCustomerDto,
  RegisterCustomerResendCodeDto,
  RegisterCustomerSendOtpDto,
  RegisterCustomerVerifyDto,
} from './dto/registerCustomer.dto';
import { AuthService } from './auth.service';
import { RegisterMarketerDto } from './dto/registerMarketer.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/sendOtpByPhoneNumber.dto';
import { LoginUser } from './dto/loginUser.dto';
import { RequestUserWithAuth } from 'src/types/authorization.types';
import { VerifyAuth } from './dto/verifyAuth.dto';
import { RabbitPublisherService } from '../rabbitmq/rabbit-publisher.service';
import { CustomPlanService } from '../custom-plan/custom-plan.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly REGISTER_OTP_COOKIE = 'register';
  private readonly LOGIN_OTP_COOKIE = 'login';

  constructor(
    private readonly authService: AuthService,
    private readonly rabbitService: RabbitPublisherService,
    private readonly planService: CustomPlanService,
  ) {}

  //#region register customer
  @Post('/register/customer/send-otp')
  async registerCustomerSendOtp(@Body() body: RegisterCustomerSendOtpDto, @Req() req: Request, @Res() res: Response) {
    const cookie = req.signedCookies[this.REGISTER_OTP_COOKIE];
    if (cookie) throw new MethodNotAllowedException('code has already sent');
    const hash = await this.authService.registerCustomerSendOtp(body);
    res.cookie(
      this.REGISTER_OTP_COOKIE,
      { hash },
      {
        maxAge: 12e4,
        signed: true,
      },
    );
    return res.status(HttpStatus.OK).json({ success: true });
  }

  @Post('/register/customer/resend-code')
  async registerCustomerResendCode(
    @Body() body: RegisterCustomerResendCodeDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const cookie = req.signedCookies[this.REGISTER_OTP_COOKIE];
    if (cookie) throw new MethodNotAllowedException('code has already sent');
    const hash = await this.authService.registerCustomerResendCode(body.mobile);
    res.cookie(
      this.REGISTER_OTP_COOKIE,
      { hash },
      {
        maxAge: 12e4,
        signed: true,
      },
    );
    return res.status(HttpStatus.OK).json({ success: true });
  }

  @Post('/register/customer/verify')
  async registerCustomerVerify(@Body() body: RegisterCustomerVerifyDto, @Req() req: Request) {
    const { session_id } = req.cookies;
    const cookie = req.signedCookies[this.REGISTER_OTP_COOKIE];
    if (!cookie?.hash) throw new BadRequestException('invalid code');
    const { token, user } = await this.authService.registerCustomerVerify(body, cookie.hash, session_id);
    return { token, user };
  }

  //old
  @Post('/register/customer')
  async registerCustomer(@Body() body: RegisterCustomerDto) {
    const token = await this.authService.registerCustomer(body);
    return { token };
  }

  //#endregion

  //#region register marketer
  @Post('/register/marketer')
  async registerMarketer(@Body() body: RegisterMarketerDto) {
    const { token, user } = await this.authService.registerMarketer(body);

    const sasinUser = ({ ...user } as any)._doc;
    console.log('ADD USER TO PLAN,SMART', user, sasinUser, {
      code: sasinUser.code,
      firstName: sasinUser.first_name,
      lastName: sasinUser.last_name,
      mobile: sasinUser.mobile,
      nationalCode: sasinUser.national_code,
      refererCode: sasinUser.identification_code,
      sasinId: sasinUser._id.toString(),
      sponsorCode: sasinUser.code_upper_head,
      username: sasinUser.username,
    });

    await this.planService.addmarketer({
      code: sasinUser.code,
      firstName: sasinUser.first_name,
      lastName: sasinUser.last_name,
      mobile: sasinUser.mobile,
      nationalCode: sasinUser.national_code,
      refererCode: sasinUser.identification_code,
      sasinId: sasinUser._id.toString(),
      sponsorCode: sasinUser.code_upper_head,
      username: sasinUser.username,
    });
    this.rabbitService.signupMarketer(sasinUser);
    return { token, user };
  }

  //#endregion

  //#region login
  @Post('/login/send-otp')
  async sendOtp(@Body() body: SendOtpDto, @Req() req: RequestUserWithAuth, @Res() res: Response) {
    const cookie = req.signedCookies[this.LOGIN_OTP_COOKIE];
    if (cookie) throw new MethodNotAllowedException('code has already sent');
    const hash = await this.authService.sendOtp(body);
    res.cookie(
      this.LOGIN_OTP_COOKIE,
      { hash },
      {
        maxAge: 12e4,
        signed: true,
      },
    );
    return res.status(HttpStatus.OK).json({ success: true });
  }

  @Post('/login/verify')
  async verfiyOtp(@Body() body: VerifyOtpDto, @Req() req: RequestUserWithAuth) {
    const { session_id } = req.cookies;
    const cookie = req.signedCookies[this.LOGIN_OTP_COOKIE];
    if (!cookie?.hash) throw new BadRequestException('invalid code');
    const { token, user } = await this.authService.verifyOtp(body, cookie.hash, session_id);
    return { token, user };
  }

  @Post('/login')
  async loginUser(@Body() body: LoginUser, @Req() req: Request, @Res() res: Response) {
    let { session_id } = req.cookies;
    if (!session_id) {
      const headers: any = res.getHeaders();
      const cookies: any = headers['set-cookie'];
      const cookie = cookies.split(';');
      const [, session_id_value] = cookie[0].split('session_id=');
      session_id = session_id_value;
    }
    const { token, user } = await this.authService.loginUser(body, session_id);
    return res.json({ success: true, data: { token, user } });
  }

  //#endregion

  //!!!!!!!!!!!!!
  @Post('/verify')
  async verifyAuth(@Body() body: VerifyAuth) {
    const errors = await this.authService.verifyAuth(body);
    if (errors.length) {
      throw new BadRequestException(errors);
    }
    return {};
  }
}
