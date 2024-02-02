import {
  Controller,
  Get,
  Req,
  UseGuards,
  Put,
  Body,
  Param,
  Query,
  NotFoundException,
  ForbiddenException,
  Post,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserAuthGuard } from 'src/guard/userAuth.guard';
import { RequestUserWithAuth, UserAuth } from 'src/types/authorization.types';
import { UserService } from './services/user.service';
import { ChangePasswordDto, UpdateEmail } from '../../types/public.types';
import { UpdateUser } from './dto/updateUser.dto';
import { QuerySubs } from './dto/querySubs.dto';
import { GetUser } from '@$/common/decorators/get-user.decorator';
import { RoleUser } from '@$/types/role.types';
import { TerminateRequestService } from './services/terminate-request.service';
import { CreateTerminateRequestDto, VerifyTerminateRequestDto } from './dto/terminate-request.dto';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';

@ApiBearerAuth('access-token')
@UseGuards(UserAuthGuard)
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly terminateService: TerminateRequestService,
  ) {}

  @Post('/marketer/terminate-request/verify')
  async terminateCoopertionVerify(@GetUser() user: UserAuth, @Body() dto: VerifyTerminateRequestDto) {
    if (!user.role.includes(RoleUser.MARKETER)) throw new ForbiddenException('access denied');
    return this.terminateService.verifyTerminateRequest(dto, user._id);
  }
  @Get('/marketer/terminate-request/:id/resend-code')
  async terminateResendCode(@GetUser() user: UserAuth, @Param('id', ParseObjectIdPipe) id: string) {
    if (!user.role.includes(RoleUser.MARKETER)) throw new ForbiddenException('access denied');
    return this.terminateService.resendCode(id, user);
  }
  @Post('/marketer/terminate-request')
  async terminateCoopertionRequest(@GetUser() user: UserAuth, @Body() dto: CreateTerminateRequestDto) {
    if (!user.role.includes(RoleUser.MARKETER)) throw new ForbiddenException('access denied');
    return this.terminateService.createTerminateRequest(dto, user._id);
  }
  @Delete('/marketer/terminate-request')
  async cancelTerminateRequest(@GetUser() user: UserAuth) {
    if (!user.role.includes(RoleUser.MARKETER)) throw new ForbiddenException('access denied');
    return this.terminateService.cancelTerminateRequest(user._id);
  }
  @Get('/marketer/terminate-request')
  async getTerminateRequests(@GetUser() user: UserAuth) {
    if (!user.role.includes(RoleUser.MARKETER)) throw new ForbiddenException('access denied');
    return this.terminateService.getMyTerminateRequests(user._id);
  }

  @Get('/profile')
  async getAccountUser(@GetUser() user: UserAuth) {
    return user;
  }

  @Get('/subs')
  async getSubsUser(@GetUser() user: UserAuth, @Query() query: QuerySubs) {
    const item = await this.userService.getSubsUser(user, query);
    return item;
  }

  @Get('/network')
  async getNetworkUser(@GetUser() user: UserAuth) {
    return this.userService.getNetworkUser(user);
  }

  @Get('/:id/network')
  async getNetworkUserById(@GetUser() user: UserAuth, @Param('id') id: string) {
    return this.userService.getNetworkUserById(id, user);
  }

  @Get('/:id/subs')
  async getSubsUserById(@GetUser() user: UserAuth, @Param('id') id: string, @Query() query: QuerySubs) {
    return this.userService.getSubsUserById(user, id, query);
  }

  @Put('/profile')
  async updateUser(@GetUser() user: UserAuth, @Body() body: UpdateUser) {
    return this.userService.updateUser(user._id, body);
  }

  // @Put('change-phoneNumber')
  @Put('change-email')
  async updateEmailUser(@Req() req: RequestUserWithAuth, @Body() body: UpdateEmail) {
    const user = req.user;
    const { otp_email_sign } = req.cookies;
    if (!otp_email_sign) {
      throw new NotFoundException('otp ارسال نشده است');
    }
    return this.userService.updateEmailUser(user._id, body, otp_email_sign);
  }

  @Put('change-password')
  async updatePasswordUser(@GetUser() user: UserAuth, @Body() body: ChangePasswordDto) {
    return this.userService.updatePasswordUser(user._id, body);
  }
}
