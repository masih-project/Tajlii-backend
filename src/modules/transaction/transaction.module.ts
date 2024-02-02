import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JWTUtils } from 'src/utils/jwt-utils';
import { PublicUtils } from 'src/utils/public-utils';
import { userSchema } from '../user/schema/user.schema';
import { orderSchema } from '../order/order.schema';
import { TransactionController } from './transaction.controller';
import { transactionSchema } from './schemas/transaction.schema';
import { TransactionService } from './services/transaction.service';
import { TransactionLogger } from 'src/logger/transaction/transactionLogger';
import { adminSchema } from '../admin/schemas/admin.schema';
import { SamanTransaction, SamanTransactionSchema } from './schemas/saman-transaction.schema';
import { SamanTransactionService } from './services/saman-transaction.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SamanTransaction.name, schema: SamanTransactionSchema },
      { name: 'admins', schema: adminSchema },
      { name: 'users', schema: userSchema },
      { name: 'orders', schema: orderSchema },
      { name: 'transactions', schema: transactionSchema },
    ]),
  ],
  controllers: [TransactionController],
  providers: [JWTUtils, PublicUtils, TransactionService, TransactionLogger, SamanTransactionService],
  exports: [TransactionService, SamanTransactionService],
})
export class TransactionModule {}
