import { statusCopun } from '../../../types/status.types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '../interface/transaction.interface';
import { TransactionQueryDto } from '../dto/transactionQuery.dto';
import { TransactionQueryAdminDto } from '../dto/transactionQueryAdmin.dto';
import { TransactionLogger } from 'src/logger/transaction/transactionLogger';
import { AdminAuth, UserAuth } from 'src/types/authorization.types';
import { SamanTransaction, SamanTransactionDocument } from '../schemas/saman-transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel('transactions') private transactionModel: Model<Transaction>,
    @InjectModel(SamanTransaction.name) private transactionSamanModel: Model<SamanTransactionDocument>,
    private readonly transactionLogger: TransactionLogger,
  ) { }
  async getTransactions(query: TransactionQueryDto): Promise<any> {
    let { limit = 20, skip = 1, order_by, order_type } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(skip - 1);
    const sort = {};
    sort[order_by] = order_type === 'ASC' ? 1 : -1;
    const items = await this.transactionModel.find({}, { user: 0 }).limit(limit).skip(skip).sort(sort);
    const count = await this.transactionModel.find().count();
    return {
      items,
      count,
    };
  }
  async getTransactionsZarinpalByAdmin(query: TransactionQueryAdminDto): Promise<any> {
    let { limit = 20, skip = 1, order_by, order_type } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(skip - 1);
    let sort = {};
    sort[order_by] = order_type === 'ASC' ? 1 : -1;
    const items = await this.transactionModel
      .find({}, {})
      .populate({
        path: 'user',
        model: 'users',
        select: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          mobile: 1,
          username: 1,
          email: 1,
          status: 1,
          role: 1,
        },
      })
      .limit(limit)
      .skip(skip)
      .sort(sort);
    const count = await this.transactionModel.find().count();
    return {
      items,
      count,
    };
  }
  async getTransactionZarinpalByAdmin(id: string): Promise<any> {
    const transaction = await this.transactionModel.findOne({ _id: id });
    if (!transaction) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return transaction;
  }
  async deleteTransactionZarinpalByAdmin(id: string, admin: string): Promise<any> {
    const transaction = await this.transactionModel.findOne({ _id: id });
    if (!transaction) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    const result = await this.transactionModel.deleteOne({ _id: id });
    await this.transactionLogger.deleteTransactionByAdmin(transaction, admin);
    return result;
  }
  async generateTransactionZarinpalExcel() {
    const transactions = await this.transactionModel.find({}, { _id: 0 }).populate('user');
    return transactions;
  }
  async getTransaction(id: string, user: UserAuth) {
    const transaction = await this.transactionModel.findOne({ _id: id, user: user._id }).populate('user');
    if (!transaction) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return transaction;
  }
  async getTransactionSamanByAdmin(id: string) {
    const samanTransaction = await this.transactionModel.findOne({
      _id: id
    });
    if (!samanTransaction) {
      throw new NotFoundException()
    }
    return samanTransaction
  }
  async getTransactionsSamanByAdmin(query: TransactionQueryAdminDto): Promise<any> {
    let { limit = 20, skip = 1, order_by, order_type } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(skip - 1);
    let sort = {};
    sort[order_by] = order_type === 'ASC' ? 1 : -1;
    const items = await this.transactionSamanModel
      .find({}, {})
      .populate({
        path: 'user',
        model: 'users',
        select: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          mobile: 1,
          username: 1,
          email: 1,
          status: 1,
          role: 1,
        },
      })
      .limit(limit)
      .skip(skip)
      .sort(sort);
    const count = await this.transactionSamanModel.find().count();
    return {
      items,
      count,
    };
  }

  async generateTransactionSamanExcel() {
    const transactions = await this.transactionSamanModel.find({}, { _id: 0 }).populate('user');
    return transactions;
  }
}
