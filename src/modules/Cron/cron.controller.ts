import { Controller } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronService } from './cron.service';

@Controller('')
export class CronController {
  constructor(private cronService: CronService) {}
  @Cron('*/2 * * * *')
  async handleCron() {
    await this.cronService.onCronOrder();
    await this.cronService.generateNetwork();
    await this.cronService.createPeriod();
    await this.cronService.onCronTransaction();
  }
  // @Cron('0 0 0 1 * *', { timeZone: 'Asia/Tehran' })
  // async handleCronEvertMonth() {
  //   await this.cronService.createPeriod()
  // }
}
