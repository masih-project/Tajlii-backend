import { UserAuth } from './../../types/authorization.types';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserAuthGuard } from 'src/guard/userAuth.guard';
import { TransactionQueryDto } from './dto/transactionQuery.dto';
import { TransactionService } from './services/transaction.service';
import { GetUser } from '@$/common/decorators/get-user.decorator';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { SamanTransactionService } from './services/saman-transaction.service';

@ApiBearerAuth('access-token')
@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly samanTransactionService: SamanTransactionService,
  ) {}

  @UseGuards(UserAuthGuard)
  @Get('/')
  async getTransactions(@Query() query: TransactionQueryDto) {
    return this.transactionService.getTransactions(query);
  }

  @UseGuards(UserAuthGuard)
  @Get('/:id')
  async getTransaction(@GetUser() user: UserAuth, @Param('id') id: string) {
    return this.transactionService.getTransaction(id, user);
  }

  @Get('/saman/:id')
  async getSamanTransaction(@Param('id', ParseObjectIdPipe) id: string) {
    return this.samanTransactionService.getTransactionWithUser(id);
  }
}
