import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { IgnoreResponseInterceptor } from '@$/common/decorators/ignore-response-interceptor.decorator';
import { DownloadExcelData, DownloadExcelInterceptor } from '@$/common/interceptors/download-excel.interceptor';
import { SearchLedgerDto } from '@$/modules/custom-plan/dtos/ledger.dto';
import { CustomPlanService } from '@$/modules/custom-plan/custom-plan.service';
import { UserService } from '@$/modules/user/services/user.service';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@Controller('admin/ledger')
@ApiTags('admin/ledger')
export class LedgerController {
  constructor(
    private customplanService: CustomPlanService,
    private userService: UserService,
  ) {}

  @IgnoreResponseInterceptor()
  @UseInterceptors(DownloadExcelInterceptor)
  @Get('/excel')
  async excelLedger(@Query() dto: SearchLedgerDto): Promise<DownloadExcelData<any>> {
    const serachResult = await this.customplanService.searchLedger(dto);
    const rewards = await Promise.all(
      serachResult.items.map(async (ledger) => {
        const user = await this.userService._findOne({ code: ledger.marketer.code });
        return {
          periodId: ledger.periodId,
          personalScore: ledger.personalScore,
          teamScore: ledger.teamScore,
          personalSale: ledger.personalSale,
          teamSale: ledger.teamSale,
          volumeBonus: ledger.volumeBonus,
          referalBonus: ledger.referalBonus,
          fullname: ledger.marketer.firstName + ' ' + ledger.marketer.lastName,
          code: ledger.marketer.code,
          nationalCode: ledger.marketer.nationalCode,
          mobile: ledger.marketer.mobile,
          bankName: user?.bank_info?.bank_name,
          shabaNumber: user?.bank_info?.shaba_number,
          accountNumber: user?.bank_info?.account_number,
          cardNumber: user?.bank_info?.card_number,
        };
      }),
    );

    return {
      filename: 'rewards',
      sheets: [
        {
          data: rewards,
          columns: {
            names: Object.keys(rewards[0]),
            titles: [
              'دوره',
              'امتیاز فردی',
              'امتیاز تیمی',
              'فروش فردی',
              'فروش تیمی',
              'پاداش حجمی',
              'پاداش معرف',
              'نام و نام خانوادگی',
              'کد',
              'کدملی',
              'شماره همراه',
              'نام بانک',
              'شماره شبا',
              'شماره حساب',
              'شماره کارت',
            ],
            widths: [7, 15, 15, 15, 15, 15, 15, 15, 10, 12, 15, 10, 40, 20, 30],
          },
        },
      ],
    };
  }

  @Get('/')
  async serachLedger(@Query() dto: SearchLedgerDto) {
    return this.customplanService.searchLedger(dto);
  }
}
