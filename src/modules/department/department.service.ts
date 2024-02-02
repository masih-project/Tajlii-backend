import { CreateDepartmentByAdminDto } from './dto/createDepartment.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublicUtils } from 'src/utils/public-utils';
import { departmentDocument } from './department.schema';
import { UpdateDepartmentByAdminDto } from './dto/updateDepartment.dto';
@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel('departments') private departmentModel: Model<departmentDocument>,
    private publicUtils: PublicUtils,
  ) {}

  async createDepartmentByAdmin(body: CreateDepartmentByAdminDto) {
    const categoryProduct = await this.departmentModel.findOne({
      name: body.name,
    });
    if (categoryProduct) {
      throw new BadRequestException('قبلا ثبت شده است');
    }
    const slug = await this.publicUtils.slug(body.name);
    return this.departmentModel.create({
      ...body,
      slug,
    });
  }

  async getDepartments() {
    const items = await this.departmentModel.find();
    const count = await this.departmentModel.find().count();
    return {
      items,
      count,
    };
  }

  async getDepartment(id: string) {
    const categoryTicket = await this.departmentModel.findOne({ _id: id });
    if (!categoryTicket) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return categoryTicket;
  }

  async updateDepartmentByAdmin(id: string, body: UpdateDepartmentByAdminDto) {
    const categoryProduct = await this.departmentModel.findOne({ _id: id });
    if (!categoryProduct) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    let slug;
    if (body.name) {
      slug = await this.publicUtils.slug(body.name);
    }
    return this.departmentModel.updateOne(
      { _id: id },
      {
        ...body,
        slug: slug ? slug : categoryProduct.slug,
      },
    );
  }
}
