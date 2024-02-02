import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PeriodService } from './period.service';

@ApiTags('Period')
@Controller('/period')
export class PeriodController {
  constructor(private periodService: PeriodService) {}
  @Get('')
  async getPeriods() {
    return await this.periodService.getPeriods();
  }
}
