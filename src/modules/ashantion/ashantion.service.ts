import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateAshantionByAdminDto } from './dto/createAshantionByAdmin.dto';
import { Ashantion } from './ashantion.interface';
import { Model } from 'mongoose';
import { UpdateAshantionByAdminDto } from './dto/updateAshantionByAdmin.dto';
import { ObjectId } from 'mongodb';
import { QueryAshantionDto } from './dto/query-ashantion.dto';

@Injectable()
export class AshantionService {
  constructor(@InjectModel('ashantions') private ashantionModel: Model<Ashantion>) {}
  async createAshantionByAdmin(body: CreateAshantionByAdminDto) {
    return this.ashantionModel.create({
      ...body,
      product: new ObjectId(body.product),
      product_ashantion: new ObjectId(body.product_ashantion),
    });
  }

  async getAshantionsByAdmin(query: QueryAshantionDto) {
    let { limit = 20, skip = 1 } = query;
    limit = Number(limit);
    skip = Number(limit) * (Number(skip) - 1);

    const sort = {};
    sort[query.order_by] = query.order_type === 'ASC' ? 1 : -1;
    const items = await this.ashantionModel
      .find()
      .populate('product', 'title_fa title_en slug img_url')
      .populate('product_ashantion', 'title_fa title_en slug img_url')
      .limit(limit)
      .skip(skip)
      .sort(sort);
    const count = await this.ashantionModel.find().count();
    return {
      items,
      count,
    };
  }

  async getAshantionByAdmin(id: string) {
    const ashantion = await this.ashantionModel.findOne({ _id: id }).populate('product').populate('product_ashantion');
    if (!ashantion) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return ashantion;
  }

  async updateAshantionByAdmin(id: string, body: UpdateAshantionByAdminDto) {
    const ashantion = await this.ashantionModel.findOne({ _id: id });
    if (!ashantion) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.ashantionModel.updateOne(
      { _id: id },
      {
        ...body,
      },
    );
  }

  async deleteAshantionByAdmin(id: string) {
    const ashantion = await this.ashantionModel.findOne({ _id: id });
    if (!ashantion) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.ashantionModel.deleteOne({ _id: id });
  }
}
