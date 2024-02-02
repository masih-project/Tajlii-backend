import { UpdateCopunDto } from './dto/updateCopun.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCopunDto } from './dto/createCopun.dto';
import { Copun } from './copun.schema';
import { Model } from 'mongoose';
import { QueryCopunDto } from './dto/queryCopun.dto';
import { OrderDocument } from '../order/order.schema';

@Injectable()
export class CouponService {
  constructor(

    @InjectModel('copuns') private copunModel: Model<Copun>,
    @InjectModel('orders') private orderModel: Model<OrderDocument>,

  ) { }
  async createCopun(body: CreateCopunDto, admin: string): Promise<any> {
    const copun = await this.copunModel.find({
      name: body.name,
      type: body.type,
    });
    if (!copun) {
      throw new BadRequestException('کد تخفیف قبلا وارد شده است');
    }
    if (body.type === 2 && body.value) {
      throw new BadRequestException('باید value خالی باشد');
    }
    if (new Date(body.finish_date).getTime() <= new Date(body.start_date).getTime()) {
      throw new BadRequestException('باید تاریخ پایان از تاریخ شروع بزرگ تر باشد');
    }
    const newCopun = await this.copunModel.create({
      ...body,
    });
    return newCopun;
  }
  async getCopuns(query: QueryCopunDto): Promise<any> {
    let { limit = 20, skip = 1, keyword = '', order_by, order_type } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(Number(skip) - 1);

    const sort = {};
    sort[order_by] = order_type === 'ASC' ? 1 : -1;
    const items = await this.copunModel
      .find({
        $or: [
          {
            name: {
              $regex: new RegExp(keyword as string),
            },
          },
          {
            value: {
              $regex: new RegExp(keyword as string),
            },
          },
        ],
      })
      .limit(limit)
      .skip(skip)
      .sort(sort);
    const count = await this.copunModel.find().count();
    return {
      items,
      count,
    };
  }
  async getCopun(id: string): Promise<any> {
    const copun = await this.copunModel.findOne({ _id: id });
    if (!copun) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return copun;
  }
  async updateCopun(id: string, body: UpdateCopunDto, admin: string): Promise<any> {
    const copun = await this.copunModel.findOne({ _id: id });
    if (!copun) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    if (body.type === 2 && body.value) {
      throw new BadRequestException('باید value خالی باشد');
    }
    if (new Date(body?.finish_date).getTime() <= new Date(body?.start_date).getTime()) {
      throw new BadRequestException('باید تاریخ پایان از تاریخ شروع بزرگ تر باشد');
    }
    const hasCopun = await this.copunModel.findOne({ name: body.name });
    if (hasCopun) {
      throw new BadRequestException('کدتخفیف قبلا وارد شده است');
    }
    const result = await this.copunModel.updateOne(
      { _id: id },
      {
        ...body,
      },
    );
    return result;
  }
  async deleteCopun(id: string, admin: string): Promise<any> {
    const copun = await this.copunModel.findOne({ _id: id });
    if (!copun) {
      throw new BadRequestException('آیتمی یافت نشد');
    }
    const result = await this.copunModel.deleteOne({ _id: id });
    return result;
  }
  async checkCouponStock(order: OrderDocument) {
    const copun = await this.copunModel.findOne({ _id: order?.copun });
    if (!copun) return
    if (copun.count_used === copun.count) {
      await this.orderModel.updateOne({ _id: order._id }, {
        $set: {
          copun: null,
          'pay_details.payment_amount': Math.round(order.pay_details.tottal_price_dicount_plan) + Math.round(order.pay_details.tottal_tax) + Math.round(order.pay_details.price_post)
        },
      })
    }

  }
  async incrementUsageCountCopun(order: OrderDocument) {
    const copun = await this.copunModel.findOne({ _id: order?.copun });
    if (!copun || !copun.count_used || !copun.count || copun.count_used === copun.count) return
    await this.copunModel.updateOne({ _id: copun._id }, {
      $inc: {
        count_used: 1
      }
    })
  }
}
