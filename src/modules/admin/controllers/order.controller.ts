import { Body, Controller, Delete, Get, Param, Patch, Query, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as excel from 'exceljs';
import { AdminGuard } from '../guards/admin.guard';
import { OrderService } from '@$/modules/order/order.service';
import { PublicUtils } from '@$/utils/public-utils';
import { QueryOrderByAdmin } from '@$/modules/order/dto/queryOrderByAdmin.dto';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { UpdateOrderByAdmin } from '@$/modules/order/dto/updateOrderByAdmin.dto';
import { QueryListOrderDto } from '@$/modules/order/dto/queryListOrder.dto';
import { Response } from 'express';
import { ApiPaginateResponse } from '@$/common/decorators/api-paginate-response.decorator';
import {
  AccumulativeReportDto,
  AccumulativeReportResponse,
  DownloadAccumulativeReportDto,
} from '@$/modules/order/dto/accumulative-report.dto';
import { IgnoreResponseInterceptor } from '@$/common/decorators/ignore-response-interceptor.decorator';
import { DownloadExcelData, DownloadExcelInterceptor } from '@$/common/interceptors/download-excel.interceptor';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/order')
@Controller('admin/order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly publicUtils: PublicUtils,
  ) {}

  @Get('/fix-bug')
  async FixBugOrder() {
    return this.orderService.FixBugOrder();
  }

  @IgnoreResponseInterceptor()
  @UseInterceptors(DownloadExcelInterceptor)
  @Get('/accumulative-report/excel')
  @HasPermissions('Read.Order')
  @ApiPaginateResponse(AccumulativeReportResponse)
  async downloadAccumulativeReport(
    @Query() dto: DownloadAccumulativeReportDto,
  ): Promise<DownloadExcelData<AccumulativeReportResponse>> {
    const { items } = await this.orderService.accumulativeReport(dto, true);
    return {
      filename: 'accumulative',
      sheets: [{ columns: { names: Object.keys(items[0]) }, data: items }],
    };
  }

  @Get('/accumulative-report')
  @HasPermissions('Read.Order')
  @ApiPaginateResponse(AccumulativeReportResponse)
  async getAccumulativeReport(@Query() dto: AccumulativeReportDto) {
    return this.orderService.accumulativeReport(dto);
  }

  @Get('/export/excel')
  @HasPermissions('Read.Order')
  async exportExcelOrdersByAdmin(@Res() res: Response) {
    const orders = await this.orderService.generateOrders();
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('orders');
    worksheet.columns = [
      { header: 'شماره سفارش', key: 'code_order', width: 18 },
      { header: 'نام مشتری', key: 'full_name', width: 18 },
      { header: 'وضعیت', key: 'status', width: 18 },
      { header: 'جمع مبلغ دریافتی', key: 'payment_amount', width: 18 },
      { header: 'جمع مبلغ خام محصولات', key: 'tottal_price', width: 18 },
      {
        header: 'جمع مبلغ محصولات با کسر تخفیف پلن',
        key: 'tottal_price_dicount_plan',
        width: 18,
      },
      { header: 'امتیاز سفارش', key: 'tottal_score_order', width: 18 },
      { header: 'تاریخ ثبت سفارش', key: 'createdAt', width: 18 },
      { header: 'دوره زمانی', key: 'period', width: 18 },
      { header: 'روش تحویل', key: 'delivery_method', width: 18 },
    ];
    const res_orders = [];
    orders.forEach((order) => {
      res_orders.push({
        code_order: order.code_order,
        full_name: `${order.user.first_name} ${order.user.last_name}`,
        payment_amount: order?.pay_details?.payment_amount || 0,
        tottal_price: order?.pay_details?.tottal_price || 0,
        tottal_price_dicount_plan: order?.pay_details?.tottal_price_dicount_plan || 0,
        tottal_score_order: order?.pay_details?.tottal_score_order || 0,
        createdAt: this.publicUtils.convertDateMiladiToShamsi(order.createdAt),
        status: this.publicUtils.getLabelStatusOrder(order.status),
        period: order?.period?.start_date ? this.publicUtils.getNameMonthShamsi(order?.period?.start_date) : '',
        delivery_method: this.publicUtils.getLabelDeliveryMethod(order.delivery_method),
      });
    });
    worksheet.addRows(res_orders);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'orders.xlsx');
    return workbook.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  }

  @Get('/list')
  @HasPermissions('Read.Order')
  async getListOrdersByAdmin(@Query() query: QueryListOrderDto) {
    return this.orderService.getListOrdersByAdmin(query);
  }

  @Get('/:id')
  @HasPermissions('Read.Order')
  async getOrdersByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.orderService.getOrderByAdmin(id);
  }

  @Delete('/:id')
  @HasPermissions('Delete.Order')
  async deleteOrderByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.orderService.deleteOrderByAdmin(id);
  }

  @Patch('/:id')
  @HasPermissions('Update.Order')
  async updateOrderByAdmin(@Param('id', ParseObjectIdPipe) id: string, @Body() body: UpdateOrderByAdmin) {
    return this.orderService.updateOrderByAdmin(id, body);
  }

  @Get('/')
  @HasPermissions('Read.Order')
  async getOrderByAdmin(@Query() query: QueryOrderByAdmin) {
    return this.orderService.getOrdersByAdmin(query);
  }
}
