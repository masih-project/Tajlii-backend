import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { SettingService } from '@$/modules/settings/setting.service';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { CreateSettingDto, UpdateSettingDto } from '@$/modules/settings/dto/createSetting.dto';
import { SettingResponse } from '@$/modules/settings/dto/setting.dto';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@Controller('admin/setting')
@ApiTags('admin/setting')
export class SettingController {
  constructor(private settingService: SettingService) {}

  @Post('/')
  @HasPermissions('Create.Setting')
  async createSettingByAdmin(@Body() body: CreateSettingDto) {
    return this.settingService.createSettingByAdmin(body);
  }

  @Patch('/')
  @HasPermissions('Update.Setting')
  async updateSettingByAdmin(@Body() body: UpdateSettingDto) {
    return this.settingService.updateSettingByAdmin(body);
  }

  @Get('/')
  @HasPermissions('Read.Setting')
  @ApiOkResponse({ type: SettingResponse })
  async getSettingByAdmin() {
    return this.settingService.getSettingByAdmin();
  }
}
