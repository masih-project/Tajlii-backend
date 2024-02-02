import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SamanTransaction } from '../schemas/saman-transaction.schema';
import { Model } from 'mongoose';
import { CreateSamanTransactionDto, UpdateSamanTransactionDto } from '../dto/saman-transaction.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class SamanTransactionService {
  constructor(@InjectModel(SamanTransaction.name) private readonly samanTransactionModel: Model<SamanTransaction>) {}

  async createTransaction(dto: CreateSamanTransactionDto) {
    return this.samanTransactionModel.create(dto);
  }

  async getTransaction(_id: ObjectId) {
    const transaction = await this.samanTransactionModel.findOne({ _id }).exec();
    if (!transaction) throw new NotFoundException('transaction not found');
    return transaction;
  }

  async getTransactionByRefNum(refNum: string) {
    return this.samanTransactionModel.findOne({ refNum }).exec();
  }

  async updateTransaction(_id: ObjectId, dto: UpdateSamanTransactionDto) {
    const result = await this.samanTransactionModel.updateOne({ _id }, dto).exec();
    if (!result.modifiedCount) throw new NotFoundException('transaction not found');
  }

  async getTransactionWithUser(_id: string) {
    const transaction = await this.samanTransactionModel.findOne({ _id }).populate('user').exec();
    if (!transaction) throw new NotFoundException('transaction not found');
    return transaction;
  }
}
