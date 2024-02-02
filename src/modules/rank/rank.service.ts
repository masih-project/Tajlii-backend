import { UpdateRankByAdminDto } from './dto/updateRankByAdmin.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { CreateRankByAdminDto } from './dto/createRankByadmin.dto';
import { Rank } from './interface/rank.interface';
import { QueryRankByAdminDto } from './dto/queryRankByAdmin.dto';
@Injectable()
export class RankService {
  constructor(@InjectModel('ranks') private rankModel: Model<Rank>) {}
  async createRankByAdmin(body: CreateRankByAdminDto) {
    return this.rankModel.create({
      ...body,
    });
  }
  async updateRankByAdmin(id: string, body: UpdateRankByAdminDto) {
    const rank = await this.rankModel.findOne({
      _id: id,
    });
    if (!rank) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.rankModel.updateOne(
      { _id: id },
      {
        ...body,
      },
    );
  }
  async deleteRankByAdmin(id: string) {
    const rank = await this.rankModel.findOne({
      _id: id,
    });
    if (!rank) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.rankModel.deleteOne({ _id: id });
  }
  async getRankByAdmin(id: string) {
    const rank = await this.rankModel.findOne({ _id: id });
    if (!rank) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return rank;
  }
  async getRanksByAdmin(query: QueryRankByAdminDto) {
    let { limit = 20, skip = 1, order_by, order_type } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(skip - 1);
    const sort = {};
    sort[order_by] = order_type === 'ASC' ? 1 : -1;
    const items = await this.rankModel.find().limit(limit).skip(skip).sort(sort);
    const count = await this.rankModel.find().count();
    return {
      items,
      count,
    };
  }
}
