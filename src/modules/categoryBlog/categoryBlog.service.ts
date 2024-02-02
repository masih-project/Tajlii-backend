import { PublicUtils } from '@$/utils/public-utils';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { categoryBlogDocument } from './categoryBlog.schema';
import { CreateCategoryBlogDto } from './dto/create-category-blog.dto';
import { UpdateCategoryBlogDto } from './dto/update-category-blog';

@Injectable()
export class CategoryBlogService {
  constructor(
    @InjectModel('categoriesBlog') private categoryBlogModel: Model<categoryBlogDocument>,
    private publicUtils: PublicUtils,
  ) {}
  async getCategoriesBlog() {
    const items = await this.categoryBlogModel.find();
    const count = await this.categoryBlogModel.find().count();
    return {
      items,
      count,
    };
  }

  async getCategoriesBlogByAdmin() {
    const items = await this.categoryBlogModel.find();
    const count = await this.categoryBlogModel.find().count();
    return {
      items,
      count,
    };
  }

  async getCategoryBlogByAdmin(id: string) {
    const blog = await this.categoryBlogModel.findOne({ _id: id });
    if (!blog) {
      throw new NotFoundException();
    }
    return blog;
  }
  async createCategoryBlogByAdmin(body: CreateCategoryBlogDto) {
    const categoryProduct = await this.categoryBlogModel.findOne({
      name: body.name,
    });
    if (categoryProduct) {
      throw new BadRequestException('قبلا ثبت شده است');
    }
    const slug = await this.publicUtils.slug(body.name);
    return this.categoryBlogModel.create({
      ...body,
      slug,
    });
  }

  async deleteCategoryBlogByAdmin(id: string) {
    const categoryBlog = await this.categoryBlogModel.findOne({ _id: id });
    if (!categoryBlog) {
      throw new NotFoundException();
    }
    await this.categoryBlogModel.deleteOne({ _id: id });
  }

  async updateCategoryBlogByAdmin(id: string, body: UpdateCategoryBlogDto) {
    const categoryProduct = await this.categoryBlogModel.findOne({ _id: id });
    if (!categoryProduct) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    let slug;
    if (body.name) {
      slug = await this.publicUtils.slug(body.name);
    }
    return this.categoryBlogModel.updateOne(
      { _id: id },
      {
        ...body,
        slug: slug ? slug : categoryProduct.slug,
      },
    );
  }
}
