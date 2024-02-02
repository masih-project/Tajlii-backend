import { Injectable } from '@nestjs/common';
import { transactionDocument } from '@$/modules/transaction/schemas/transaction.schema';

@Injectable()
export class TransactionLogger {
  deleteTransactionByAdmin(transaction: transactionDocument, admin: string) {
    const template = `
        <div>
              تراکنش با شناسه
              ${transaction.transactionـcode}
              توسط
            ${admin}
            حذف شد
        </div>
        `;
    return template;
  }
}
