import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SettingService } from './setting.service';

@Controller('')
@ApiTags('Settings')
export class SettingController {
  constructor(private settingService: SettingService) {}
}
