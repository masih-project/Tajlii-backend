import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  AssessContractDto,
  CreateLegalContractDto,
  CreateNaturalContractDto,
  SearchContractDto,
} from '../dtos/contract.dto';
import { LegalContract } from '../schemas/legal-contract.schema';
import { Contract } from '../schemas/contract.schema';
import { NaturalContract } from '../schemas/natural-contract.schema';

@Injectable()
export class ContractService {
  constructor(
    @InjectModel(Contract.name) private contractModel: Model<Contract>,
    @InjectModel(LegalContract.name) private legalModel: Model<LegalContract>,
    @InjectModel(NaturalContract.name) private naturalModel: Model<NaturalContract>,
  ) {}

  async createLegalContract(dto: CreateLegalContractDto) {
    return this.legalModel.create(dto);
  }

  async createNaturalContract(dto: CreateNaturalContractDto) {
    return this.naturalModel.create(dto);
  }

  async getContract(_id: string) {
    const contract = await this.contractModel.findOne({ _id }).exec();
    if (!contract) throw new NotFoundException('contract not found');
    return contract;
  }

  async assessContract(_id: string, dto: AssessContractDto) {
    const result = await this.contractModel.updateOne({ _id }, dto).exec();
    if (!result.modifiedCount) throw new NotFoundException();
    return this.contractModel.findOne({ _id });
  }

  async serachContract(dto: SearchContractDto) {
    const { sortBy, sortOrder, skip, limit, dateFrom, dateTo, ...rest } = dto;
    const filters: FilterQuery<Contract> = rest;
    if (dateFrom || dateTo)
      filters.createdAt = {
        ...(dateFrom && { $gte: new Date(dateFrom) }),
        ...(dateTo && { $lte: new Date(dateTo) }),
      };
    filters.mobile = new RegExp(rest.mobile);
    filters.fullname = new RegExp(rest.fullname);
    filters.nationalCode = new RegExp(rest.nationalCode);
    const sort = { [sortBy ?? 'createdAt']: sortOrder === 'ASC' ? 1 : -1 };
    return this._search2(filters, sort, skip, limit);
  }

  private async _search2(
    filter?: FilterQuery<Contract>,
    sort?: { [k in keyof Contract]?: 1 | -1 },
    skip?: number,
    limit?: number,
  ) {
    const query = this.contractModel.aggregate();
    if (filter) query.match(filter);
    if (sort) query.sort(sort);

    const result = await query
      .facet({
        items: [{ $skip: skip ?? 0 }, { $limit: limit ?? 100 }],
        count: [{ $count: 'count' }],
      })
      .project({ items: 1, count: { $first: '$count.count' } })
      .exec();
    return { count: result[0].count, items: result[0].items };
  }
}
