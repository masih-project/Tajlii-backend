import { ApiPaginateResponse } from 'src/common/decorators/api-paginate-response.decorator';
import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Param,
  Put,
  Delete,
  NotFoundException,
  BadRequestException,
  Query,
  Patch,
} from '@nestjs/common';
import { CreateAdminDto } from '../dto/createAdmin.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UpdateAdminDto } from '../dto/updateAdmin.dto';
import { QueryAdmin } from '../dto/queryAdmin.dto';
import { ChangePasswordDto, UpdateEmail, UpdatePhoneNumber } from 'src/types/public.types';
import { ApiItemResponse } from 'src/common/decorators/api-item-response.decorator';
import { AdminResponse } from '../dto/admin.dto';
import { RequestAdminWithAuth } from 'src/types/authorization.types';
import { AdminService } from '../services/admin.service';
import { AdminGuard } from '../guards/admin.guard';
import { GetAdmin } from '@$/common/decorators/get-admin.decorator';
import { AdminDocument } from '../schemas/admin.schema';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { UpdateAdminMeDto } from '../dto/updateAdminMe.dto';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('/profile')
  @ApiItemResponse(AdminResponse)
  getAccountAdminInfo(@GetAdmin() admin: AdminDocument) {
    return admin;
  }

  @Patch('/profile')
  async updateAdminAccountMe(@GetAdmin() admin: AdminDocument, @Body() body: UpdateAdminMeDto) {
    return this.adminService.updateAdminProfile(admin._id, body);
  }

  @Patch('/change-phoneNumber')
  async updatePhoneNumberAdmin(
    @GetAdmin() admin: AdminDocument,
    @Body() body: UpdatePhoneNumber,
    @Req() req: RequestAdminWithAuth,
  ) {
    const { otp_sms_sign } = req.cookies;
    if (!otp_sms_sign) {
      throw new BadRequestException('otp ارسال نشد');
    }
    return this.adminService.updatePhoneNumberAdmin(admin._id, body, otp_sms_sign);
  }

  @Patch('/change-email')
  async updateEmailAdmin(
    @GetAdmin() admin: AdminDocument,
    @Body() body: UpdateEmail,
    @Req() req: RequestAdminWithAuth,
  ) {
    const { otp_email_sign } = req.cookies;
    if (!otp_email_sign) {
      throw new NotFoundException('otp ارسال نشده است');
    }
    return this.adminService.updateEmailAdmin(admin._id, body, otp_email_sign);
  }

  @Patch('/change-password')
  async chnagePasswordAdmin(@GetAdmin() admin: AdminDocument, @Body() body: ChangePasswordDto) {
    ///@ts-ignore
    return this.adminService.changePasswordAdmin(admin._id, body);
  }

  @Post('/')
  @HasPermissions('Create.Admin')
  async createAdmin(@Body() body: CreateAdminDto) {
    return this.adminService.createAdmin(body);
  }

  @Get('/:id')
  @HasPermissions('Read.Admin')
  @ApiOkResponse({ type: AdminResponse })
  async getAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.adminService.getAdmin(id);
  }

  @Put('/:id')
  @HasPermissions('Update.Admin')
  async updateAdmin(@Param('id', ParseObjectIdPipe) id: string, @Body() body: UpdateAdminDto) {
    return this.adminService.updateAdmin(id, body);
  }

  @Get('/')
  @HasPermissions('Read.Admin')
  @ApiPaginateResponse(AdminResponse)
  async getAdmins(@Query() query: QueryAdmin, @GetAdmin() admin: AdminDocument) {
    return this.adminService.getAdmins(admin._id, query);
  }

  @Delete('/:id')
  @HasPermissions('Delete.Admin')
  async deleteAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.adminService.deleteAdmin(id);
  }
}
