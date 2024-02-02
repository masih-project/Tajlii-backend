import { UpdatePeriodDto } from './dto/updatePeriod.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Period } from './interface/period.interface';
import { QueryPeriodDto } from './dto/queryPeriod.dto';
import { CreatePeriodDto } from './dto/createPeriod.dto';

@Injectable()
export class PeriodService {
  constructor(@InjectModel('periods') private periodModel: Model<Period>) {}
  async getPeriodsByAdmin(query: QueryPeriodDto) {
    const { status } = query;
    const items = await this.periodModel.find({
      ...(status !== undefined && {
        status: query.status,
      }),
    });
    const count = await this.periodModel
      .find({
        ...(status !== undefined && {
          status: query.status,
        }),
      })
      .count();
    return {
      items,
      count,
    };
  }
  async getPeriod(id: string) {
    const period = await this.periodModel.findOne({ _id: id });
    if (!period) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return period;
  }
  async updatePeriodByAdmin(id, body: UpdatePeriodDto) {
    const period = await this.periodModel.findOne({ _id: id });
    if (!period) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.periodModel.updateOne(
      { _id: id },
      {
        ...body,
      },
    );
  }
  async createPeriodByAdmin(body: CreatePeriodDto) {
    return this.periodModel.create({
      ...body,
    });
  }
  async deletePeriodByAdmin(id: string) {
    const period = await this.periodModel.findOne({ _id: id });
    if (!period) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.periodModel.deleteOne({ _id: id });
  }
  async getPeriods() {
    const items = await this.periodModel.find({}, { status: 0 });
    const count = await this.periodModel.find().count();
    return {
      items,
      count,
    };
  }

  // async getCurrentPeriod() {
  //   const start_shamsi = JallaiMoment().locale('fa').startOf('month').format('YYYY-MM-DD HH:mm');
  //   const end_shamsi = JallaiMoment().locale('fa').endOf('month').format('YYYY-MM-DD HH:mm');
  //   const start_miladi = JallaiMoment.from(start_shamsi, 'fa', 'YYYY-MM-DD hh:mm')
  //     .locale('en')
  //     .format('YYYY-MM-DD HH:mm');
  //   const end_miladi = JallaiMoment.from(end_shamsi, 'fa', 'YYYY-MM-DD hh:mm').format('YYYY-MM-DD HH:mm');
  //   const start_miladiISOString = new Date(start_miladi).toISOString();
  //   const end_miladiISOString = new Date(end_miladi).toISOString();
  //   const period = await this.periodModel.findOne({
  //     start_date: start_miladiISOString,
  //     end_date: end_miladiISOString,
  //   });
  //   if (!period) throw new InternalServerErrorException('current period not found!');
  //   return period;
  // }
}
