import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContractService } from './services/contract.service';
import {
  CreateLegalContractDto,
  CreateNaturalContractDto,
  VerifyCodeAndCreateLegalDto,
  VerifyCodeAndCreateNaturalDto,
} from './dtos/contract.dto';
import { Cookie, ResponseWithCookie } from '@$/common/interceptors/log-and-map-response.interceptor';
import { randomCode } from '@$/utils/otp-utils';
import { SmsUtils } from '@$/utils/sm-utils';
import { Cookies } from '@$/common/decorators/cookies.decorator';
//====================================================================
const CONTRACT_OTP_COOKIE = 'contract';

@ApiTags('contract')
@Controller('contract')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private readonly smsService: SmsUtils,
  ) {}

  @Post('/legal')
  async createLegalContract(@Body() dto: CreateLegalContractDto, @Cookies(CONTRACT_OTP_COOKIE) cookie: any) {
    if (cookie) throw new BadRequestException('code has alredy sent');
    const code = randomCode();
    this.smsService.sendVerifyCode(dto.mobile, code);
    return new ResponseWithCookie({}, new Cookie(CONTRACT_OTP_COOKIE, { code, mobile: dto.mobile }, { maxAge: 120e4 }));
  }
  @Post('/natural')
  async createNaturalContract(@Body() dto: CreateNaturalContractDto, @Cookies(CONTRACT_OTP_COOKIE) cookie: any) {
    if (cookie) throw new BadRequestException('code has alredy sent');
    const code = randomCode();
    this.smsService.sendVerifyCode(dto.mobile, code);
    return new ResponseWithCookie(
      {},
      new Cookie(CONTRACT_OTP_COOKIE, { code: code, mobile: dto.mobile }, { maxAge: 12e4 }),
    );
  }

  @Post('/legal/verify-code')
  async verifyCodeAndCreateLegal(
    @Body() dto: VerifyCodeAndCreateLegalDto,
    @Cookies(CONTRACT_OTP_COOKIE) cookie: { code: string; mobile: string },
  ) {
    const { code, ...rest } = dto;
    if (!cookie || code !== cookie.code) throw new BadRequestException('invalid code');
    if (dto.mobile !== cookie.mobile) throw new BadRequestException('invalid mobile');
    return this.contractService.createLegalContract(rest);
  }
  @Post('/natural/verify-code')
  async verifyCodeAndCreateNatural(
    @Body() dto: VerifyCodeAndCreateNaturalDto,
    @Cookies(CONTRACT_OTP_COOKIE) cookie: { code: string; mobile: string },
  ) {
    const { code, ...rest } = dto;
    if (!cookie || code !== cookie.code) throw new BadRequestException('invalid code');
    if (dto.mobile !== cookie.mobile) throw new BadRequestException('invalid mobile');
    return this.contractService.createNaturalContract(rest);
  }
}
