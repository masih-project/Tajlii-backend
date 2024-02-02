import { ObjectId } from 'mongodb';
import { TransactionStatus } from '../schemas/saman-transaction.schema';

export class CreateSamanTransactionDto {
  user: ObjectId;
  order: ObjectId;
  status: TransactionStatus;
  amount: number;
  ip?: string;
  campaignId?: string;
}

export class UpdateSamanTransactionDto {
  status?: TransactionStatus;
  refNum?: string;
  tokenResult?: any;
  paymentResult?: any;
  verifyResult?: any;
  reversalResult?: any;
}
