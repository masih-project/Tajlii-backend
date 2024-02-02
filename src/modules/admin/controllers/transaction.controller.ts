import { Controller, Delete, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as excel from 'exceljs';
import { AdminGuard } from '../guards/admin.guard';
import { TransactionQueryAdminDto } from '@$/modules/transaction/dto/transactionQueryAdmin.dto';
import { Response } from 'express';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { GetAdmin } from '@$/common/decorators/get-admin.decorator';
import { AdminDocument } from '../schemas/admin.schema';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { TransactionService } from '@$/modules/transaction/services/transaction.service';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/transaction')
@Controller('admin/transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/zarinpal')
  @HasPermissions('Read.Transaction')
  async getTransactionsZarinpalByAdmin(@Query() query: TransactionQueryAdminDto) {
    return this.transactionService.getTransactionsZarinpalByAdmin(query);
  }

  @Get('/zarinpal/:id')
  @HasPermissions('Read.Transaction')
  async getTransactionZarinpalByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.transactionService.getTransactionZarinpalByAdmin(id);
  }

  @Delete('/zarinpal/:id')
  @HasPermissions('Delete.Transaction')
  async deleteTransactionZarinpalByAdmin(@GetAdmin() admin: AdminDocument, @Param('id', ParseObjectIdPipe) id: string) {
    return this.transactionService.deleteTransactionZarinpalByAdmin(id, admin.username);
  }

  @Get('/zarinpal/excel')
  @HasPermissions('Read.Transaction')
  async generateTransactionZarinpalExcel(@Res() res: Response) {
    const transactions = await this.transactionService.generateTransactionZarinpalExcel();
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');
    worksheet.columns = [
      { header: 'code transaction', key: 'code_transaction', width: 5 },
      { header: 'Name', key: 'user.first_name' + 'user.last_name', width: 5 },
      { header: 'refID', key: 'refID', width: 5 },
      { header: 'cardHash', key: 'cardHash', width: 5 },
      { header: 'amount', key: 'amount', width: 5 },
      { header: 'status', key: 'status', width: 5 },
      { header: 'transaction code', key: 'transactionـcode', width: 5 },
    ];

    worksheet.addRows(transactions);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'transactions.xlsx');
    return workbook.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  }

  @Get('/saman')
  @HasPermissions('Read.Transaction')
  async getTransactionsSamanByAdmin(@Query() query: TransactionQueryAdminDto) {
    return this.transactionService.getTransactionsSamanByAdmin(query);
  }

  @Get('/saman/:id')
  @HasPermissions('Read.Transaction')
  async getTransactionSamanByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.transactionService.getTransactionSamanByAdmin(id);
  }
  @Get('/saman/excel')
  @HasPermissions('Read.Transaction')
  async generateTransactionSamanExcel(@Res() res: Response) {
    const transactions = await this.transactionService.generateTransactionSamanExcel();
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');
    worksheet.columns = [
      { header: 'code transaction', key: 'code_transaction', width: 5 },
      { header: 'Name', key: 'user.first_name' + 'user.last_name', width: 5 },
      { header: 'refID', key: 'refID', width: 5 },
      { header: 'cardHash', key: 'cardHash', width: 5 },
      { header: 'amount', key: 'amount', width: 5 },
      { header: 'status', key: 'status', width: 5 },
      { header: 'transaction code', key: 'transactionـcode', width: 5 },
    ];

    worksheet.addRows(transactions);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'transactions.xlsx');
    return workbook.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  }
}
