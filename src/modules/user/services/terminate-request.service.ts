import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { TerminateRequest } from '../schema/terminate-request.schema';
import { CreateTerminateRequestDto, VerifyTerminateRequestDto } from '../dto/terminate-request.dto';
import { HashUtils } from '@$/utils/hast-utils';
import { SmsUtils } from '@$/utils/sm-utils';
import { randomInt } from 'crypto';
import { UserService } from './user.service';
import { ObjectId } from 'mongodb';
import { UserAuth } from '@$/types/authorization.types';
import { AssessTerminateRequestDto, SearchTerminateRequestDto } from '@$/modules/admin/dto/terminate-request.dto';
import { dateToJalaliYearMonth } from '@$/utils/mongoose.utils';
import { UserDocument } from '../schema/user.schema';
import { SearchDto } from '@$/common/dtos/search.dto';

@Injectable()
export class TerminateRequestService {
  private EXPIRE_SMS_TIME = 12e4; // 2 min
  constructor(
    @InjectModel(TerminateRequest.name) private model: Model<TerminateRequest>,
    private readonly hashUtils: HashUtils,
    private readonly sms: SmsUtils,
    private readonly userService: UserService,
  ) {}

  async createTerminateRequest(dto: CreateTerminateRequestDto, userId: string | ObjectId) {
    const reqCount = await this.model.count({ user: userId, status: { $ne: 'Rejected' } });
    if (reqCount) throw new BadRequestException('request is created already');

    const user = await this.userService.getUserById(userId);
    const isValid = await this.hashUtils.verifyPassword(dto.password, user.password);
    if (!isValid) throw new ForbiddenException('incorrect password');

    const code = randomInt(99999).toString().padStart(5, '0');
    const terminate = await this.model.create({
      reason: dto.reason,
      description: dto.description,
      status: 'New',
      user: user._id,
      code,
    });

    await this.sms.sendVerifyCode(user.mobile, code);
    return {
      requestId: terminate._id,
      reason: terminate.reason,
      description: terminate.description,
    };
  }

  async resendCode(requestId: string, user: UserAuth) {
    const terminate = await this.model.findOne({
      _id: requestId,
      user: user._id,
      status: 'New',
    });
    if (!terminate) throw new NotFoundException('request not found');
    const timepassed = Date.now() - (terminate['updatedAt'] as Date).getTime();
    if (timepassed < this.EXPIRE_SMS_TIME) throw new BadRequestException('code has already sent');

    if (!terminate) throw new NotFoundException('request not found');
    terminate.code = randomInt(99999).toString().padStart(5, '0');
    await terminate.save();
    await this.sms.sendVerifyCode(user.mobile, terminate.code);
    return {
      requestId: terminate._id,
      reason: terminate.reason,
      description: terminate.description,
    };
  }

  async cancelTerminateRequest(userId: string | ObjectId) {
    const terminate = await this.model.findOne({ user: userId, status: { $in: ['New', 'Requested'] } });
    if (!terminate) throw new BadRequestException('terminate request not found');
    return this.model.deleteOne({ _id: terminate._id });
  }

  async verifyTerminateRequest(dto: VerifyTerminateRequestDto, userId: string | ObjectId) {
    const terminate = await this.model.findOne(
      {
        _id: dto.requestId,
        user: userId,
        status: 'New',
      },
      { code: 1, status: 1, updatedAt: 1 },
    );
    if (!terminate) throw new NotFoundException('request not found');
    const timepassed = Date.now() - (terminate['updatedAt'] as Date).getTime();
    if (timepassed > this.EXPIRE_SMS_TIME || dto.code !== terminate.code) throw new BadRequestException('invalid code');

    terminate.status = 'Requested';
    await terminate.save();
    return {
      requestId: terminate._id,
      status: terminate.status,
    };
  }

  async search(dto: SearchTerminateRequestDto) {
    return this._search1(dto, [{ field: 'user', select: ['_id', 'code', 'mobile', 'first_name', 'last_name'] }]);
  }

  async getMyTerminateRequests(userId: string | ObjectId) {
    return this.model.find({ user: userId });
  }

  async getTerminateInfo(_id: string) {
    const terminate = await this.model.findOne({ _id }).populate('user').exec();
    if (!terminate) throw new NotFoundException('terminate request not found');
    return terminate;
  }

  private async _search1<T extends SearchDto>(
    dto: T,
    populates?: { field: keyof TerminateRequest; select?: string[] }[],
  ) {
    const { sortBy, sortOrder, skip, limit, dateFrom, dateTo, ...rest } = dto;
    const filters: FilterQuery<TerminateRequest> = rest;
    if (dateFrom || dateTo)
      filters.createdAt = {
        ...(dateFrom && { $gte: new Date(dateFrom) }),
        ...(dateTo && { $lte: new Date(dateTo) }),
      };
    const sort = { [sortBy ?? 'createdAt']: sortOrder === 'ASC' ? 1 : -1 };
    const query = this.model.find(filters, {}, { sort, skip, limit });
    if (populates?.length) {
      for (let i = 0; i < populates.length; i++) query.populate(populates[i].field, populates[i].select);
    }
    const items = await query.exec();
    const count = await this.model.count(filters);
    return { count, items };
  }

  // private async _search2(
  //   filter?: FilterQuery<TerminateRequest>,
  //   sort?: { [k in keyof TerminateRequest]?: 1 | -1 },
  //   skip?: number,
  //   limit?: number,
  // ) {
  //   console.time('search2=>aggregation');
  //   const query = this.model.aggregate();
  //   if (filter) query.match(filter);
  //   if (sort) query.sort(sort);

  //   const result = await query
  //     .lookup({ from: 'users', foreignField: '_id', localField: 'user', as: 'user' })
  //     .facet({
  //       items: [{ $skip: skip ?? 0 }, { $limit: limit ?? 100 }],
  //       count: [{ $count: 'count' }],
  //     })
  //     .project({ items: 1, count: { $first: '$count.count' } })
  //     .exec();
  //   console.timeEnd('search2=>aggregation');
  //   return { count: result[0].count, items: result[0].items };
  // }

  // ADMIN
  async assessTerminateRequest(_id: string, dto: AssessTerminateRequestDto) {
    const terminate = await this.model.findOne({ _id /* status: 'Requested' */ }).populate('user').exec();
    if (!terminate) throw new NotFoundException('terminate request not found');

    terminate.status = dto.terminate ? 'Confirmed' : 'Rejected';
    terminate.assessDescription = dto.description;
    await terminate.save();

    await this.userService.terminateCooperation(terminate.user as unknown as UserDocument);
    return terminate;
  }
  //#region report
  async terminationRequestReport() {
    return this.model.aggregate([
      {
        $addFields: {
          jalalidate: {
            $function: {
              body: dateToJalaliYearMonth,
              args: ['$createdAt'],
              lang: 'js',
            },
          },
        },
      },
      {
        $group: {
          _id: {
            date: '$jalalidate',
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          status: '$_id.status',
          count: 1,
        },
      },
    ]);
  }
  //#endregion
}
