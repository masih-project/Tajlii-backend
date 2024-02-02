import { statusTransaction } from 'src/types/status.types';

export interface Transaction {
  user: string;
  authority: string;
  refID: string;
  cardHash: string;
  amount: number;
  status: statusTransaction.AWAITING_PAYMENT | statusTransaction.FAILED | statusTransaction.SUCCESS;
  baskets: any[];
  order: string;
  transactionـcode: string;
  payment_way: number;
}
