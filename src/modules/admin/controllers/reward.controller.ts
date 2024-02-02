import { QueryExportExcelRewardByAdmin } from './../../reward/dto/QueryExportExcelReward.dto';
import { RewardService } from '@$/modules/reward/reward.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as excel from 'exceljs';
import { AdminGuard } from '../guards/admin.guard';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { Response } from 'express';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { UpdateRewardByAdminDto } from '@$/modules/reward/dto/updateRewardByAdmin.dto';
import { GenreateRewardDto } from '@$/modules/reward/dto/genreateReward.dto';
import { PersonalRewardDto } from '@$/modules/reward/dto/personalReward.dto';
import { IdentificationRewardDto } from '@$/modules/reward/dto/identificationReward.dto';
import { QueryRewardByAdmin } from '@$/modules/reward/dto/queryReward.dto';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@Controller('admin/reward')
@ApiTags('admin/reward')
export class RewardController {
  constructor(private rewareService: RewardService) {}

  @Get('/')
  @HasPermissions('Read.Reward')
  async getRewardsByAdmin(@Query() query: QueryRewardByAdmin) {
    return this.rewareService.getRewardsByAdmin(query);
  }

  @Get('/test')
  @HasPermissions('Read.Reward')
  async getRewardsTestByAdmin(@Query() query: QueryRewardByAdmin) {
    return this.rewareService.getRewardsTestByAdmin(query);
  }

  @Get('/export/excel')
  @HasPermissions('Read.Reward')
  async exportExcelReward(@Res() res: Response, @Query() query: QueryExportExcelRewardByAdmin) {
    const rewards = await this.rewareService.exportExcelReward(query);
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Rewards');
    worksheet.columns = [
      { header: 'نام و نام خانوادگی', key: 'full_name', width: 15 },
      { header: 'کدملی', key: 'national_code', width: 15 },
      { header: 'مبلغ واریزی', key: 'price_reward', width: 15 },
      { header: 'شماره همراه', key: 'mobile', width: 15 },
      { header: 'نام بانک', key: 'bank_name', width: 15 },
      { header: 'شماره کارت', key: 'card_number', width: 15 },
      { header: 'شماره حساب', key: 'account_number', width: 15 },
      { header: 'شماره شبا', key: 'shaba_number', width: 15 },
    ];
    const excel_reward = [];
    rewards.forEach((reward: any) => {
      excel_reward.push({
        price_reward: reward.price_reward,
        full_name: `${reward.user.first_name} ${reward.user.last_name}`,
        national_code: reward.user.national_code,
        mobile: reward.user.mobile,
        bank_name: reward?.user?.bank_info?.bank_name || '',
        card_number: reward?.user?.bank_info?.card_number || '',
        account_number: reward?.user?.bank_info?.account_number || '',
        shaba_number: `IR${reward?.user?.bank_info?.shaba_number || ''}`,
      });
    });
    worksheet.addRows(excel_reward);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'rewards.xlsx');
    return workbook.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  }

  @Get('/:id')
  @HasPermissions('Read.Reward')
  async getRewardByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.rewareService.getRewardByAdmin(id);
  }

  @Patch('/:id')
  @HasPermissions('Update.Reward')
  async updateRewardByAdmin(@Param('id', ParseObjectIdPipe) id: string, @Body() body: UpdateRewardByAdminDto) {
    return this.rewareService.updateRewardByAdmin(id, body);
  }

  @Delete('/:id')
  @HasPermissions('Delete.Reward')
  async deleteRewardByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.rewareService.deleteRewardByAdmin(id);
  }

  @Post('/multiLevel')
  @HasPermissions('Read.Reward')
  async MultiLevelReward(@Body() body: GenreateRewardDto) {
    return this.rewareService.MultiLevelReward(body);
  }

  @Post('/generation')
  @HasPermissions('Read.Reward')
  async generationReward(@Body() body: GenreateRewardDto) {
    return this.rewareService.generationReward(body);
  }

  @Delete('/')
  @HasPermissions('Delete.Reward')
  async deleteReward() {
    return this.rewareService.deleteReward();
  }

  @Post('/personal')
  @HasPermissions('Read.Reward')
  async PersonalReward(@Body() body: PersonalRewardDto) {
    return this.rewareService.PersonalReward(body);
  }

  @Post('/identification')
  @HasPermissions('Read.Reward')
  async identificationReward(@Body() body: IdentificationRewardDto) {
    return this.rewareService.identificationReward(body);
  }

  @Post('/test/identification')
  @HasPermissions('Read.Reward')
  async identificationRewardTest(@Body() body: IdentificationRewardDto) {
    return await this.rewareService.identificationRewardTest(body);
  }

  @Post('/test/generation')
  @HasPermissions('Read.Reward')
  async generationRewardTest(@Body() body: GenreateRewardDto) {
    return await this.rewareService.generationRewardTest(body);
  }
}
