import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Province, ProvinceDocument } from './provice.schema';

@Injectable()
export class ProvinceService {
  constructor(@InjectModel('provinces') private provinces: Model<Province>) {}
  async getProvinces(): Promise<any[]> {
    const items = await this.provinces.find();
    return items;
  }
}
