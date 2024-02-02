import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCategoryDto } from './dto/crateCategory.dto';
import mongoose, { Model } from 'mongoose';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { Category } from './categroy.interface';
import { PublicUtils } from 'src/utils/public-utils';
import { ObjectId } from 'mongodb';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel('categories') private categoryModel: Model<Category>,
    private readonly publicUtils: PublicUtils,
  ) {}
  async createCategoryByAdmin(body: CreateCategoryDto): Promise<any> {
    const slug = this.publicUtils.slug(body.slug);
    return this.categoryModel.create({
      ...body,
      slug,
      parent: body.parent ? new mongoose.Types.ObjectId(body.parent) : null,
    });
  }
  async getCategories(): Promise<any> {
    const categories = await this.categoryModel.find({ parent: undefined });
    return categories;
  }
  async getCategory(slug: string): Promise<any> {
    const category = await this.categoryModel.findOne({ slug }).populate('brands', 'name slug');
    return category;
  }
  async updateCategoryByAdmin(id: string, body: UpdateCategoryDto): Promise<any> {
    const category = await this.categoryModel.findOne({ _id: id });
    if (!category) throw new NotFoundException();
    const slug = this.publicUtils.slug(body?.slug);
    return this.categoryModel.updateOne(
      { _id: id },
      {
        ...body,
        slug: body.slug ? slug : category.slug,
      },
    );
  }
  async deleteCategoryByAdmin(id: string): Promise<any> {
    return this.categoryModel.deleteOne({ _id: id });
  }

  async getCategoriesByAdmin() {
    const items = await this.categoryModel.find();
    const count = await this.categoryModel.find().count();
    return {
      items,
      count,
    };
  }

  async getCategoryById(_id: string): Promise<any> {
    const category = await this.categoryModel.findOne({ _id: new ObjectId(_id) });
    return category;
  }
}
