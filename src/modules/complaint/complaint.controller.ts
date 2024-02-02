import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  MethodNotAllowedException,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ComplaintService } from './services/complaint.service';
import { AddComplaintDto, ComplaintResponse, GetSmsCodeDto } from './dtos/complaint.dto';
import { SmsUtils } from '@$/utils/sm-utils';
import { randomInt } from 'crypto';
import { Request, Response } from 'express';
import { AuditLogInterceptor } from '@$/common/interceptors/audit-log.interceptor';

@ApiTags('complaint')
@Controller('complaint')
export class ComplaintController {
  constructor(
    private readonly complaintService: ComplaintService,
    private readonly sms: SmsUtils,
  ) {}

  @Get('/code')
  async getCode(@Query() dto: GetSmsCodeDto, @Req() req: Request, @Res() res: Response) {
    const { complaint } = req.signedCookies;
    if (complaint) throw new MethodNotAllowedException('code has already sent');

    const code = randomInt(99999).toString().padStart(5, '0');
    await this.sms.sendVerifyCode(dto.phone, code);
    res.cookie(
      'complaint',
      { code },
      {
        maxAge: 60e3,
        signed: true,
      },
    );
    return res.status(HttpStatus.OK).json({ success: true });
  }

  @Post('/')
  @UseInterceptors(AuditLogInterceptor)
  @ApiOkResponse({ type: ComplaintResponse })
  async createComplaint(@Body() dto: AddComplaintDto, @Req() req: Request) {
    const { complaint } = req.signedCookies;
    if (!complaint?.code || complaint.code !== dto.code) throw new BadRequestException('invalid code');
    return this.complaintService.addComplaint(dto);
  }
}
