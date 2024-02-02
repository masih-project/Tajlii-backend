import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { AdminService } from '../services/admin.service';
import { LoginAdminDto, SignupAdminDto } from '../dto/createAdmin.dto';
import { Response } from 'express';

@ApiTags('admin/auth')
@Controller('/admin/auth')
export class AdminAuthController {
  constructor(private adminService: AdminService) {}

  @Post('/login')
  async login(@Body() dto: LoginAdminDto) {
    return this.adminService.login(dto);
  }

  @ApiExcludeEndpoint()
  @Post('/oauth2-login')
  async oaut2_login(@Body() dto: LoginAdminDto, @Res() res: Response) {
    const result = await this.adminService.login(dto);
    res.send({
      access_token: result.accessToken,
    });
  }

  @Post('/signup')
  async signup(@Body() dto: SignupAdminDto) {
    return this.adminService.signup(dto);
  }
}
