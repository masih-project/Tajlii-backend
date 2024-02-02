import { Brand } from './interface/brand.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBrandDto } from './dto/createBrand.dto';
import { UpdateBrandDto } from './dto/updateBrand.dto';
import { QueryBrand } from './dto/queryBrand.dto';
import { PublicUtils } from 'src/utils/public-utils';
import { AdminAuth } from 'src/types/authorization.types';
import { BrandLogger } from 'src/logger/brand/brandLogger';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel('brands') private brandModel: Model<Brand>,
    private readonly publicUtils: PublicUtils,
    private readonly brandLogger: BrandLogger,
  ) {}
  async createBrandByAdmin(body: CreateBrandDto, admin: string) {
    const slug = this.publicUtils.slug(body.slug);
    const brand = await this.brandModel.create({
      ...body,
      slug,
    });
    return brand;
  }

  async getBrands(query: QueryBrand): Promise<any> {
    let { limit = 20, skip = 1, keyword = '', order_by, order_type } = query;
    const sort = {};
    sort[order_by] = order_type === 'ASC' ? 1 : -1;
    limit = Number(limit);
    skip = Number(limit) * Number(Number(skip) - 1);
    const count = await this.brandModel
      .find({
        $or: [
          {
            name: {
              $regex: new RegExp(keyword as string),
            },
          },
          {
            slug: {
              $regex: new RegExp(keyword as string),
            },
          },
        ],
      })
      .count();
    const items = await this.brandModel
      .aggregate([
        { $addFields: { _id: { $toString: '$_id' } } },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'brand',
            as: 'products',
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1,
            number_of_product: { $size: '$products' },
          },
        },
      ])
      .limit(limit)
      .skip(skip)
      .sort(sort);
    return {
      count,
      items,
    };
  }
  async getBrand(id: string): Promise<any> {
    const brand = await this.brandModel.findOne({ _id: id }, { __v: 0 })
    if (!brand) {
      throw new BadRequestException('آیتمی یافت نشد');
    }
    return brand;
  }
  async updateBrandByAdmin(id: string, body: UpdateBrandDto, admin: string) {
    const brand = await this.brandModel.findOne({ _id: id });
    if (!brand) {
      throw new BadRequestException('آیتمی یافت نشد');
    }
    let slug;
    if (body.slug) {
      slug = this.publicUtils.slug(body.slug);
    }
    const result = await this.brandModel.updateOne(
      { _id: id },
      {
        ...body,
        slug,
      },
    );
    return result;
  }
  async deleteBrandByAdmin(id: string, admin: string) {
    const brand = await this.brandModel.findOne({ _id: id });
    const result = await this.brandModel.deleteOne({ _id: id });
    return result;
  }
}
