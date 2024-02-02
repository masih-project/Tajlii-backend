import { UserAuth } from 'src/types/authorization.types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookMark } from './bookMark.schema';
import { QueryBookMark } from './dto/queryBookMark.dto';
import { BookMarkLogger } from 'src/logger/bookMark/bookMarkLogger';
import { Product } from '../product/schemas/product.schema';

@Injectable()
export class BookMarkService {
  constructor(
    @InjectModel('bookMarks') private bookMarkModel: Model<BookMark>,
    @InjectModel('products') private productModel: Model<Product>,
    private readonly bookMarkLogger: BookMarkLogger,
  ) {}
  async createBookMark(id: string, user: UserAuth): Promise<any> {
    const product = await this.bookMarkModel.findOne({
      _id: id,
    });
    if (!product) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.bookMarkModel.create({
      user: user._id,
      product: id,
    });
  }
  async deleteBookMark(id: string, user: UserAuth): Promise<any> {
    const bookMark = await this.bookMarkModel.findOne({ _id: id, user: user._id });
    if (!bookMark) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.bookMarkModel.deleteOne({ _id: id });
  }
  async getBookMarks(user: UserAuth, input: QueryBookMark): Promise<any> {
    let { limit = 20, skip = 1 } = input;
    limit = Number(limit);
    skip = Number(limit) * Number(skip - 1);
    const bookMarks = await this.bookMarkModel
      .find({ user: user._id }, { user: 0 })
      .populate('product')
      .limit(limit)
      .skip(skip);
    const count = await this.bookMarkModel.find({ user: user._id }).count();
    return {
      items: bookMarks,
      count,
    };
  }
}
