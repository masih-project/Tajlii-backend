import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Layout } from '../schemas/layout.schema';
import { AddLayoutDto, EditLayoutDto } from '../dtos/add-layout.dto';

@Injectable()
export class LayoutService {
  constructor(@InjectModel(Layout.name) private layoutModel: Model<Layout>) {}

  async addLayout(dto: AddLayoutDto) {
    return this.layoutModel.create(dto);
  }

  async getLayout(_id: string) {
    const layout = await this.layoutModel.findOne({ _id }).exec();
    if (!layout) throw new NotFoundException('layout not found');
    return layout;
  }

  async getAll() {
    return this.layoutModel.find().exec();
  }

  async getActiveLayout() {
    return this.layoutModel.findOne({ isActive: true }).exec();
  }

  async editLayout(_id: string, dto: EditLayoutDto) {
    const result = await this.layoutModel.updateOne({ _id }, dto).exec();
    if (!result.modifiedCount) throw new NotFoundException();
    return this.layoutModel.findOne({ _id });
  }
}
