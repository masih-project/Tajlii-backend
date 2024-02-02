import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DepotLogger } from 'src/logger/depot/depotLogger';
import { Depot } from './depot.interface';
import { CreateDepotDto } from './dto/createDepot.dto';
import { QueryDepot } from './dto/queryDepot.dto';
import { UpdateDepotDto } from './dto/updateDepot.dto';
import { statusInventory } from '@$/types/status.types';

@Injectable()
export class DepotService {
  constructor(
    @InjectModel('depots') private depotModel: Model<Depot>,
    private readonly depotLogger: DepotLogger,
  ) {}
  async createDepotByAdmin(input: CreateDepotDto, admin: string): Promise<any> {
    const newDepot = await this.depotModel.create({
      ...input,
    });
    return newDepot;
  }
  async updateDepotByAdmin(id: string, body: UpdateDepotDto, admin: string): Promise<any> {
    const depot = await this.depotModel.findOne({ _id: id });
    if (!depot) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    const result = await this.depotModel.updateOne({ _id: id }, body);
    return result;
  }

  async deleteDepotByAdmin(id: string, admin: string): Promise<any> {
    const depot = await this.depotModel.findOne({ _id: id });
    if (!depot) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    const result = await this.depotModel.deleteOne({ _id: id });
    return result;
  }
  async getDepotsByAdmin(input: QueryDepot): Promise<any> {
    let { limit = 20, skip = 1, keyword = '', order_by, order_type } = input;
    limit = Number(limit);
    skip = Number(limit) * Number(skip - 1);
    const sort = {};
    sort[order_by] = order_type === 'ASC' ? 1 : -1;
    const count = await this.depotModel
      .find({
        $or: [
          {
            $or: [
              {
                title: {
                  $regex: new RegExp(keyword as string),
                  $options: 'i',
                },
                phone: {
                  $regex: new RegExp(keyword as string),
                  $options: 'i',
                },
                address: {
                  $regex: new RegExp(keyword as string),
                  $options: 'i',
                },
              },
            ],
          },
        ],
      })
      .count();
    const items = await this.depotModel
      .find(
        {
          $or: [
            {
              title: {
                $regex: new RegExp(keyword as string),
                $options: 'i',
              },
              phone: {
                $regex: new RegExp(keyword as string),
                $options: 'i',
              },
              address: {
                $regex: new RegExp(keyword as string),
                $options: 'i',
              },
            },
          ],
        },
        { __v: 0 },
      )
      .limit(limit)
      .skip(skip)
      .sort(sort);
    return {
      count,
      items,
    };
  }
  async getDepotByAdmin(id: string): Promise<any> {
    const depot = await this.depotModel.findOne({ _id: id }, { __v: 0 });
    if (!depot) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return depot;
  }
  async getDepots() {
    const items = await this.depotModel.find({
      status: {
        $in: [statusInventory.CONFIRMED],
      },
    });
    return {
      items,
      count: items.length,
    };
  }
}
