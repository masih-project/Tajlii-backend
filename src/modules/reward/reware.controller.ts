import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RewardService } from './reward.service';
import { UserAuthGuard } from '@$/guard/userAuth.guard';
import { GetUser } from '@$/common/decorators/get-user.decorator';
import { UserAuth } from '@$/types/authorization.types';
import { QueryRewardDto } from './dto/query-reward.dto';
import * as excel from 'exceljs';
import { Response } from 'express';
import { QueryExportExcelReward, QueryExportExcelRewardByAdmin } from './dto/QueryExportExcelReward.dto';
import { PublicUtils } from '@$/utils/public-utils';
import { rewardDocument } from './reward.schema';

@ApiBearerAuth('access-token')
@UseGuards(UserAuthGuard)
@ApiTags('Reward')
@Controller('reward')
export class RewaredController {
  constructor(
    private rewareService: RewardService,
    private publicUtils: PublicUtils,
  ) {}

  @Get('/')
  async getRewards(@GetUser() user: UserAuth, @Query() query: QueryRewardDto) {
    return await this.rewareService.getRewards(user._id, query);
  }

  @Get('/export/excel')
  async exportExcelReward(@GetUser() user: UserAuth, @Res() res: Response, @Query() query: QueryExportExcelReward) {
    const rewards: any[] = await this.rewareService.exportExcelReward({
      user: user._id,
      ...(query.type !== undefined && {
        type: query.type,
      }),
      ...(query.period !== undefined && {
        period: query.period,
      }),
    });
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Rewards');
    worksheet.columns = [
      { header: 'نوع پاداش', key: 'type', width: 15 },
      { header: 'مبلغ', key: 'price_reward', width: 15 },
      { header: 'دوره زمانی', key: 'period', width: 15 },
      { header: 'تاریخ پرداخت', key: 'datePayment', width: 15 },
    ];
    const excel_reward = [];
    rewards.forEach((reward) => {
      excel_reward.push({
        price_reward: reward.price_reward,
        type: this.publicUtils.getLabelReward(reward.type),
        period: this.publicUtils.getNameMonthShamsi(reward.period.createdAt),
        datePayment: this.publicUtils.convertDateMiladiToShamsi(reward.period.updatedAt),
      });
    });
    worksheet.addRows(excel_reward);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'rewards.xlsx');
    return workbook.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  }
}
