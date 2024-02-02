import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactUsDto, SearchContactusDto } from '../dtos/contactus.dto';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { ContactUs } from '../schemas/contactus.schema';
import { FilterQuery, Model, ProjectionType, QueryOptions } from 'mongoose';

@Injectable()
export class ContactUsService {
  constructor(@InjectModel(ContactUs.name) private model: Model<ContactUs>) {}

  async addContactus(dto: ContactUsDto, userId?: string) {
    return this.model.create({
      ...dto,
      user: userId ? new ObjectId(userId) : undefined,
    });
  }

  async getOne(_id: string | ObjectId) {
    const contactus = await this.model.findOne({ _id: new ObjectId(_id) });
    if (!contactus) throw new NotFoundException('contact-us not found');
    return contactus;
  }

  async search(dto: SearchContactusDto) {
    const { sortBy, sortOrder, skip, limit, dateFrom, dateTo, ...rest } = dto;
    const filters: FilterQuery<ContactUs> = rest;
    if (dateFrom || dateTo)
      filters.createdAt = {
        ...(dateFrom && { $gte: new Date(dateFrom) }),
        ...(dateTo && { $lte: new Date(dateTo) }),
      };
    filters.phone = new RegExp(filters.phone);
    const sort = { [sortBy ?? 'createdAt']: sortOrder === 'ASC' ? 1 : -1 };
    // return this._search1(filters, {}, { sort, skip, limit });
    return this._search2(filters, sort, skip, limit);
  }

  private async _search1(
    filter?: FilterQuery<ContactUs>,
    projection?: ProjectionType<ContactUs>,
    options?: QueryOptions<ContactUs>,
  ) {
    console.time('search1=>2queries');
    const items = await this.model.find(filter, projection, options);
    const count = await this.model.count(filter);
    console.timeEnd('search1=>2queries');
    return { count, items };
  }

  private async _search2(
    filter?: FilterQuery<ContactUs>,
    sort?: { [k in keyof ContactUs]?: 1 | -1 },
    skip?: number,
    limit?: number,
  ) {
    console.time('search2=>aggregation');
    const query = this.model.aggregate();
    if (filter) query.match(filter);
    if (sort) query.sort(sort);

    const result = await query
      .facet({
        items: [{ $skip: skip ?? 0 }, { $limit: limit ?? 100 }],
        count: [{ $count: 'count' }],
      })
      .project({ items: 1, count: { $first: '$count.count' } })
      .exec();
    console.timeEnd('search2=>aggregation');
    return { count: result[0].count, items: result[0].items };
  }
}
