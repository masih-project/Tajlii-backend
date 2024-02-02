import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSettingDto, UpdateSettingDto } from './dto/createSetting.dto';
import { Setting } from './setting.schema';

@Injectable()
export class SettingService {
  constructor(@InjectModel('settings') private settingModel: Model<Setting>) {}
  async createSettingByAdmin(body: CreateSettingDto) {
    return this.settingModel.create({
      ...body,
    });
  }
  async updateSettingByAdmin(body: UpdateSettingDto) {
    const setting = await this.settingModel.findOne();
    if (!setting) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.settingModel.updateOne(
      { _id: setting._id },
      {
        ...body,
      },
    );
  }
  async deleteSettingByAdmin(id: string) {
    await this.settingModel.deleteOne({ _id: id });
  }
  async getSettingByAdmin() {
    const item = await this.settingModel.findOne();
    return item;
  }
}
