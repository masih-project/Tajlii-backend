/* eslint-disable prefer-const */
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import 'moment-timezone';
import * as JallaiMoment from 'jalali-moment';
import { HashUtils } from '../../../utils/hast-utils';
import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SkanetUser, User } from 'src/modules/user/user.interface';
import { AuthService } from '../../Auth/auth.service';
import { UpdateEmail, ChangePasswordDto } from '../../../types/public.types';
import { UpdateUser } from '../dto/updateUser.dto';
import { UpdateUserByAdmin } from '../dto/updateUserByAdmin.dto';
import { QueryUser } from '../dto/queryUser.dto';
import { CreateUserByAdmin } from '../dto/createUserByAdmin.dto';
import { statusUser } from 'src/types/status.types';
import { UserAuth } from 'src/types/authorization.types';
import { QuerySkanetUser } from '../dto/querySkanetUser.dto';
import { QueryExcelUser } from '../dto/queryExcelUser.dto';
import { PublicUtils } from 'src/utils/public-utils';
import { Network } from '../../network/network.schema';
import { QuerySubs } from '../dto/querySubs.dto';
import { Period } from '../../period/interface/period.interface';
import { RoleUser } from '@$/types/role.types';
import { VezaratService } from './vezarat.service';
import { UserDocument } from '../schema/user.schema';
import { Admin } from '@$/modules/admin/schemas/admin.schema';
import { randomInt } from 'crypto';
import { dateToJalaliYearMonth } from '@$/utils/mongoose.utils';
import { SmsUtils } from '@$/utils/sm-utils';
import { CreateUserTestDto } from '../dto/create-user-test.dto';
import { rankDocument } from '@$/modules/rank/rank.schema';
import { RabbitPublisherService } from '@$/modules/rabbitmq/rabbit-publisher.service';
import { CustomPlanService } from '@$/modules/custom-plan/custom-plan.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('users') private userModel: Model<User>,
    @InjectModel('skanetusers') private skanetUserModel: Model<SkanetUser>,
    @InjectModel('networks') private networkModel: Model<Network>,
    @InjectModel('admins') private adminModel: Model<Admin>,
    @InjectModel('periods') private periodModel: Model<Period>,
    @InjectModel('ranks') private rankModel: Model<rankDocument>,
    private readonly authService: AuthService,
    private readonly hashUtils: HashUtils,
    private readonly publicUtils: PublicUtils,
    private readonly vezaratService: VezaratService,
    private readonly smsService: SmsUtils,
    private readonly rabbitService: RabbitPublisherService,
    private readonly planService: CustomPlanService,
  ) {}

  async changeReferalToCode() {
    const marketers = await this.userModel.find({ role: ['MARKETER'] });
    for (let i = 0; i < marketers.length; i++) {
      const m = marketers[i];
      if (m.code_upper_head) {
        const upper = marketers.find((x) => x.national_code === m.code_upper_head);
        if (upper) m.code_upper_head = upper.code;
        else console.log('UPPER not found');
      }
      if (m.identification_code) {
        const ref = marketers.find((x) => x.national_code === m.identification_code);
        if (ref) m.identification_code = ref.code;
        else console.log('REF not found');
      }
      await m.save();
    }
  }

  async changeReferalToCodeForUsers() {
    const marketers = await this.userModel.find({ role: ['MARKETER'] });
    const users = await this.userModel.find({ role: ['CUSTOMER'] });
    for (let i = 0; i < users.length; i++) {
      const usr = users[i];
      if (usr.identification_code) {
        const ref = marketers.find((x) => x.national_code === usr.identification_code);
        if (ref) usr.identification_code = ref.code;
        else console.log('REF not found');
      }
      await usr.save();
    }
  }

  async updateEmailUser(id: string, body: UpdateEmail, otp_email_sign: string): Promise<any> {
    await this.authService.verifyOtpByEmail(body, otp_email_sign);
    return this.userModel.updateOne(
      { _id: id },
      {
        email: body.email,
      },
    );
  }

  async getUserByAdmin(_id: string) {
    const user = await this.userModel.findOne({ _id }, { __v: 0, password: 0 });
    return user;
  }

  async _findOne(query: FilterQuery<UserDocument>): Promise<UserDocument> {
    return this.userModel.findOne(query);
  }
  async _find(query: FilterQuery<UserDocument>): Promise<UserDocument[]> {
    return this.userModel.find(query);
  }
  async _update(_id: ObjectId, dto: Partial<User>) {
    return this.userModel.updateOne(
      { _id },
      {
        $set: dto,
      },
    );
  }

  async getUserById(_id: string | ObjectId) {
    const user = await this.userModel.findOne({ _id });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async getUsersById(_ids: (string | ObjectId)[]) {
    return this.userModel.find({ _id: { $in: _ids } });
  }
  async userExists(_id: string | ObjectId) {
    const count = await this.userModel.count({ _id });
    if (!count) throw new NotFoundException('user not found');
  }

  async usersExists(_ids: string[]) {
    const count = await this.userModel.count({ _id: { $in: _ids } });
    if (count !== new Set(_ids).size) throw new NotFoundException('users not found');
  }

  async adminExists(_id: string | ObjectId) {
    const count = await this.adminModel.count({ _id });
    if (!count) throw new NotFoundException('admin not found');
  }

  async getUsersByAdmin(query: QueryUser): Promise<any> {
    let {
      limit = 20,
      skip = 1,
      father_name = '',
      national_code = '',
      birth_certificate_code = '',
      username = '',
      code_upper_head = '',
      identification_code = '',
      first_name = '',
      last_name = '',
      mobile = '',
      phone_number = '',
      marketer_code = '',
    } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(Number(skip) - 1);
    const sort = {};
    sort[query.order_by] = query.order_type === 'ASC' ? 1 : -1;
    const matchFilter = {
      ...(query.role !== undefined && {
        role: query.role,
      }),
      ...(query.status !== undefined && {
        status: {
          $in: Array.isArray(query.status) ? [...query.status] : [query.status],
        },
      }),
      ...(query.gender !== undefined && {
        gender: query.gender,
      }),
    };
    const searchFilter = [];

    if (first_name) searchFilter.push({ first_name: { $regex: new RegExp(first_name, 'i') } });
    if (last_name) searchFilter.push({ last_name: { $regex: new RegExp(last_name, 'i') } });
    if (father_name) searchFilter.push({ father_name: { $regex: new RegExp(father_name, 'i') } });
    if (identification_code)
      searchFilter.push({ identification_code: { $regex: new RegExp(identification_code, 'i') } });
    if (code_upper_head) searchFilter.push({ code_upper_head: { $regex: new RegExp(code_upper_head, 'i') } });
    if (mobile) searchFilter.push({ mobile: { $regex: new RegExp(mobile, 'i') } });
    if (phone_number) searchFilter.push({ phone_number: { $regex: new RegExp(phone_number, 'i') } });
    if (username) searchFilter.push({ username: { $regex: new RegExp(username, 'i') } });
    if (marketer_code) searchFilter.push({ marketer_code: { $regex: new RegExp(marketer_code, 'i') } });
    if (birth_certificate_code)
      searchFilter.push({ birth_certificate_code: { $regex: new RegExp(birth_certificate_code, 'i') } });
    const users = await this.userModel.aggregate([
      {
        $match: {
          ...matchFilter,
          ...(searchFilter.length && {
            $or: searchFilter,
          }),
        },
      },
      {
        $lookup: {
          from: 'provinces',
          localField: 'city_id',
          foreignField: 'cities._id',
          as: 'province',
        },
      },
      {
        $unwind: {
          path: '$province',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          'province.city': {
            $cond: {
              if: {
                $and: [{ $not: { $eq: ['$city_id', null] } }, { $ne: ['$city_id', ''] }],
              },
              then: {
                $filter: {
                  input: '$province.cities',
                  cond: {
                    $eq: ['$$this._id', '$city_id'],
                  },
                },
              },
              else: [],
            },
          },
        },
      },
      {
        $unwind: {
          path: '$province.city',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          'province.cities': 0, // Remove the province.cities field
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'identification_code',
          foreignField: 'code',
          as: 'identification',
        },
      },
      {
        $unwind: {
          path: '$identification',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'code_upper_head',
          foreignField: 'code',
          as: 'upper_head',
        },
      },
      {
        $unwind: {
          path: '$upper_head',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: sort,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    const count = await this.userModel
      .find({
        ...matchFilter,
        ...(searchFilter.length && {
          $or: searchFilter,
        }),
      })
      .count();
    return {
      count,
      items: users,
    };
  }

  async deleteUserByAdmin(id: string): Promise<any> {
    const user = await this.userModel.findOne({ _id: id });
    if (!user) throw new NotFoundException('user not found');
    const result = await this.userModel.deleteOne({ _id: id });
    if (process.env.NODE_ENV === 'production') {
      if (user.role.includes(RoleUser.MARKETER) && result.deletedCount)
        await this.vezaratService.revokeMarketer(user.national_code);
    }
    await this.planService.deleteMarketer(user.code);
    await this.rabbitService.deleteMarketer(user.code);
    return result;
  }

  async updateUser(id: string, body: UpdateUser): Promise<any> {
    return this.userModel.updateOne(
      { _id: id },
      {
        ...body,
      },
    );
  }
  async updateUserByAdmin(id: string, body: UpdateUserByAdmin): Promise<any> {
    const username = body?.username?.toLocaleLowerCase();
    let data = {
      ...body,
    };
    const user = await this.userModel.findOne({ _id: id });
    if (!user) {
      throw new NotFoundException('آیتمی بافت نشد');
    }
    if (username) {
      const hasUsername = await this.userModel.findOne({
        username,
      });
      if (hasUsername) {
        throw new BadRequestException('یوزر نیم انتخابی قبلا انتخاب شده است');
      }
      data = {
        ...data,
        username,
      };
    }
    if (body.mobile) {
      const hasMobile = await this.userModel.findOne({ mobile: body.mobile, role: user.role });
      if (hasMobile) {
        throw new BadRequestException('شماره موردنظر قبلا انتخاب شده است');
      }
    }
    if (body.national_code) {
      const hasNationalCode = await this.userModel.findOne({ national_code: body.national_code });
      if (hasNationalCode) {
        throw new BadRequestException('کدملی موردنظر قبلا انتخاب شده است');
      }
    }
    if (body.password) {
      const password = await this.hashUtils.hashString(body.password);
      data = {
        ...data,
        password,
      };
    }
    await this.userModel.updateOne(
      { _id: id },
      {
        ...data,
        ...(body.status === statusUser.CANCELED && {
          date_expired: new Date(),
        }),
      },
    );

    await this.planService.editMarketer(user.code, {
      mobile: data.mobile,
      nationalCode: data.national_code,
      username: data.username,
      refererCode: data.identification_code,
      sponsorcode: data.code_upper_head,
    });
    await this.rabbitService.updateMarketerData(user.code, {
      mobile: data.mobile,
      nationalCode: data.national_code,
      username: data.username,
      refererCode: data.identification_code,
      sponsorcode: data.code_upper_head,
    });
  }
  async updatePasswordUser(id: string, body: ChangePasswordDto): Promise<any> {
    if (body.password !== body.confirm_password) {
      throw new BadGatewayException('رمز عبور و تکرار رمز عبور با هم تطابق ندارد');
    }
    const password = await this.hashUtils.hashString(body.password);
    return await this.userModel.updateOne(
      { _id: id },
      {
        password,
      },
    );
  }

  async createUserByAdmin(body: CreateUserByAdmin): Promise<any> {
    if (body.password !== body.confirm_password) {
      throw new BadRequestException('رمز عبور با تکرار رمز عبور مطابقت ندارد');
    }
    const hasUsername = await this.userModel.findOne({
      username: body.username.toLocaleLowerCase(),
    });
    if (hasUsername) {
      throw new BadRequestException('یوزرنیم قبلا ثبت شده است');
    }
    const hashPhoneNumber = await this.userModel.findOne({
      mobile: body.mobile,
    });
    if (hashPhoneNumber) {
      throw new BadRequestException('شماره قبلا ثبت شده است');
    }
    const hasNationalCode = await this.userModel.findOne({
      national_code: body.national_code,
    });
    if (hasNationalCode) {
      throw new BadRequestException('کدملی قبلا ثبت شده است');
    }
    const hasIdentification_code = await this.userModel.findOne({ code: body.identification_code });
    if (!hasIdentification_code) {
      throw new BadRequestException('کدملی واردشده وجود ندارد');
    }
    if (body.code_upper_head) {
      const hasCodeUpperHead = await this.userModel.findOne({
        code: body.code_upper_head,
      });
      if (!hasCodeUpperHead) {
        throw new BadRequestException('کدملی واردشده وجود ندارد');
      }
    }
    const password = await this.hashUtils.hashString(body.password);
    const code = body.role.includes(RoleUser.MARKETER) ? await this.generateUniqueCode() : undefined;
    let vezaratCode: string;
    if (process.env.NODE_ENV === 'production') {
      if (body.role.includes(RoleUser.MARKETER)) {
        vezaratCode = await this.vezaratService.registerMarketer({
          nationalCode: body.national_code,
          firstName: body.first_name ?? '',
          lastName: body.last_name ?? '',
          birthDate: body.brith_day ?? '',
          address: body.address ?? '',
          education: '',
          email: body.email ?? '',
          fatherName: body.father_name ?? '',
          idNo: '',
          parentNationalCode: '',
          phone1: body.phone_number ?? '',
          phone2: '',
          postalCode: body.postal_code ?? '',
        });
      }
    }
    const user = await this.userModel.create({
      ...body,
      password,
      status: statusUser.CONFIRMED,
      username: body.username.toLocaleLowerCase(),
      marketer_code: vezaratCode,
      code,
    });

    await this.planService.addmarketer({
      code: user.code,
      firstName: user.first_name,
      lastName: user.last_name,
      mobile: user.mobile,
      nationalCode: user.national_code,
      refererCode: user.identification_code,
      sasinId: user._id.toString(),
      sponsorCode: user.code_upper_head,
      username: user.username,
    });
    this.rabbitService.signupMarketer(({ ...user } as any)._doc);

    return user;
  }

  async getSubsUser(user: UserAuth, query: QuerySubs): Promise<any> {
    const start_shamsi = JallaiMoment().locale('fa').startOf('month').format('YYYY-MM-DD HH:mm');
    const end_shamsi = JallaiMoment().locale('fa').endOf('month').format('YYYY-MM-DD HH:mm');
    const start_miladi = JallaiMoment.from(start_shamsi, 'fa', 'YYYY-MM-DD hh:mm')
      .locale('en')
      .format('YYYY-MM-DD HH:mm');
    const end_miladi = JallaiMoment.from(end_shamsi, 'fa', 'YYYY-MM-DD hh:mm').format('YYYY-MM-DD HH:mm');
    const start_miladiISOString = new Date(start_miladi).toISOString();
    const end_miladiISOString = new Date(end_miladi).toISOString();
    let period = await this.periodModel.findOne({ start_date: start_miladiISOString, end_date: end_miladiISOString });
    if (query.period) {
      period = await this.periodModel.findOne({ _id: new ObjectId(query.period) });
    }
    const periods = await this.periodModel.find({
      start_date: {
        $lte: new Date(period.start_date),
      },
    });
    const id_periods = periods.map((p) => new ObjectId(p._id));
    const users = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(user._id),
        },
      },
      {
        $lookup: {
          from: 'users',
          let: {
            codeUpperHead: '$code',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$code_upper_head', '$$codeUpperHead'],
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                let: {
                  codeUpperHead: '$code',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$code_upper_head', '$$codeUpperHead'],
                      },
                    },
                  },
                ],
                as: 'children',
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: {
                  user_id: { $toObjectId: '$_id' },
                  period_id: new ObjectId(period._id),
                },
                pipeline: [
                  {
                    $lookup: {
                      from: 'ranks',
                      let: {
                        rank_id: '$rank',
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$rank_id'],
                            },
                          },
                        },
                      ],
                      as: 'rank',
                    },
                  },
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $and: [
                              {
                                $eq: ['$user', '$$user_id'],
                              },
                              {
                                $eq: ['$period', '$$period_id'],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: '$rank',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'network',
              },
            },
            {
              $unwind: {
                path: '$network',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $graphLookup: {
                from: 'users',
                startWith: '$code_upper_head',
                connectFromField: 'code',
                connectToField: 'code_upper_head',
                as: 'ancestors',
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: {
                  user_id: { $toObjectId: '$_id' },
                  period_id: [...id_periods],
                },
                pipeline: [
                  {
                    $lookup: {
                      from: 'ranks',
                      let: {
                        rank_id: '$rank',
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$rank_id'],
                            },
                          },
                        },
                      ],
                      as: 'rank',
                    },
                  },
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $and: [
                              {
                                $eq: ['$user', '$$user_id'],
                              },
                              {
                                $in: ['$period', '$$period_id'],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: '$rank',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'networks',
              },
            },
            {
              $addFields: {
                'network_total.personal_selling': {
                  $sum: {
                    $sum: '$networks.personal_selling',
                  },
                },
                'network_total.tottal_score_order': {
                  $sum: {
                    $sum: '$networks.tottal_score_order',
                  },
                },
                'network_total.tottal_team_score_order': {
                  $sum: {
                    $sum: '$networks.tottal_team_score_order',
                  },
                },
                'network_total.team_selling': {
                  $sum: {
                    $sum: '$networks.tottal_team_score_order',
                  },
                },
              },
            },
            {
              $addFields: {
                sub_length: {
                  $size: '$children',
                },
                sub_total_length: {
                  $size: '$ancestors',
                },
              },
            },
            {
              $project: {
                ancestors: 0,
                children: 0,
              },
            },
          ],
          as: 'children',
        },
      },
      {
        $lookup: {
          from: 'networks',
          let: {
            user_id: { $toObjectId: '$_id' },
            period_id: new ObjectId(period._id),
          },
          pipeline: [
            {
              $lookup: {
                from: 'ranks',
                let: {
                  rank_id: '$rank',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$rank_id'],
                      },
                    },
                  },
                ],
                as: 'rank',
              },
            },
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$user', '$$user_id'],
                        },
                        {
                          $eq: ['$period', '$$period_id'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$rank',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'network',
        },
      },
      {
        $unwind: {
          path: '$network',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'networks',
          let: {
            user_id: { $toObjectId: '$_id' },
            period_id: [...id_periods],
          },
          pipeline: [
            {
              $lookup: {
                from: 'ranks',
                let: {
                  rank_id: '$rank',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$rank_id'],
                      },
                    },
                  },
                ],
                as: 'rank',
              },
            },
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$user', '$$user_id'],
                        },
                        {
                          $in: ['$period', '$$period_id'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$rank',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'networks',
        },
      },
      {
        $graphLookup: {
          from: 'users',
          startWith: '$code_upper_head',
          connectFromField: 'code',
          connectToField: 'code_upper_head',
          as: 'ancestors',
        },
      },
      {
        $addFields: {
          sub_total_length: {
            $size: '$ancestors',
          },
          sub_length: {
            $size: '$children',
          },
        },
      },
      {
        $project: {
          ancestors: 0,
        },
      },
      {
        $addFields: {
          'network_total.personal_selling': {
            $sum: {
              $sum: '$networks.personal_selling',
            },
          },
          'network_total.tottal_score_order': {
            $sum: {
              $sum: '$networks.tottal_score_order',
            },
          },
          'network_total.tottal_team_score_order': {
            $sum: {
              $sum: '$networks.tottal_team_score_order',
            },
          },
          'network_total.team_selling': {
            $sum: {
              $sum: '$networks.tottal_team_score_order',
            },
          },
          networks: [],
        },
      },
    ]);
    return users[0];
  }
  async getSkanetUsersByAdmin(query: QuerySkanetUser): Promise<any> {
    let { limit = 20, skip = 1, keyword = '', order_by, order_type } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(Number(skip) - 1);
    const sort = {};
    sort[order_by] = order_type === 'ASC' ? 1 : -1;
    const items = await this.skanetUserModel.aggregate([
      {
        $match: {
          $or: [
            { first_name: { $regex: new RegExp(keyword as string), $options: 'i' } },
            { last_name: { $regex: new RegExp(keyword as string), $options: 'i' } },
            { national_code: { $regex: new RegExp(keyword as string), $options: 'i' } },
            { identification_code: { $regex: new RegExp(keyword as string), $options: 'i' } },
            {
              code_upper_head: {
                $regex: new RegExp(keyword as string),
                $options: 'i',
              },
            },
          ],
        },
      },
      {
        $sort: sort,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'skanetusers',
          let: {
            refcode: '$identification_code',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$national_code', '$$refcode'],
                },
              },
            },
          ],
          as: 'identification',
        },
      },
      {
        $lookup: {
          from: 'skanetusers',
          let: {
            uppercode: '$code_upper_head',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$national_code', '$$uppercode'],
                },
              },
            },
          ],
          as: 'upper_head',
        },
      },
      {
        $unwind: {
          path: '$identification',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$upper_head',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    const count = await this.skanetUserModel
      .find({
        $or: [
          { first_name: { $regex: new RegExp(keyword as string), $options: 'i' } },
          { last_name: { $regex: new RegExp(keyword as string), $options: 'i' } },
          { national_code: { $regex: new RegExp(keyword as string), $options: 'i' } },
          { identification_code: { $regex: new RegExp(keyword as string), $options: 'i' } },
          {
            code_upper_head: {
              $regex: new RegExp(keyword as string),
              $options: 'i',
            },
          },
        ],
      })
      .count();
    return {
      count,
      items,
    };
  }
  async getSkanetUserByAdmin(id: string): Promise<any> {
    const skanetUser = await this.skanetUserModel.findOne({ _id: id });
    if (!skanetUser) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return skanetUser;
  }
  async genrateExcelUsers(query: QueryExcelUser): Promise<any> {
    let items = [];
    if (!query.role) {
      items = await this.userModel.find();
    } else {
      items = await this.userModel.find({
        role: query.role,
      });
    }
    return items;
  }
  async getSubsUserById(user: UserAuth, id: string, query: QuerySubs): Promise<any> {
    const item_parents: UserDocument = await this.getUserWithSubs(new ObjectId(user._id));
    const has_nested = await this.publicUtils.findNested(item_parents.subs, id);
    if (!has_nested) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    const start_shamsi = JallaiMoment().locale('fa').startOf('month').format('YYYY-MM-DD HH:mm');
    const end_shamsi = JallaiMoment().locale('fa').endOf('month').format('YYYY-MM-DD HH:mm');
    const start_miladi = JallaiMoment.from(start_shamsi, 'fa', 'YYYY-MM-DD hh:mm')
      .locale('en')
      .format('YYYY-MM-DD HH:mm');
    const end_miladi = JallaiMoment.from(end_shamsi, 'fa', 'YYYY-MM-DD hh:mm').format('YYYY-MM-DD HH:mm');
    const start_miladiISOString = new Date(start_miladi).toISOString();
    const end_miladiISOString = new Date(end_miladi).toISOString();
    let period = await this.periodModel.findOne({ start_date: start_miladiISOString, end_date: end_miladiISOString });
    if (query.period) {
      period = await this.periodModel.findOne({ _id: new ObjectId(query.period) });
    }
    const periods = await this.periodModel.find({
      start_date: {
        $lte: new Date(period.start_date),
      },
    });
    const id_periods = periods.map((p) => new ObjectId(p._id));
    const users = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'users',
          let: {
            codeUpperHead: '$code',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$code_upper_head', '$$codeUpperHead'],
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                let: {
                  codeUpperHead: '$code',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$code_upper_head', '$$codeUpperHead'],
                      },
                    },
                  },
                ],
                as: 'children',
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: {
                  user_id: { $toObjectId: '$_id' },
                  period_id: new ObjectId(period._id),
                },
                pipeline: [
                  {
                    $lookup: {
                      from: 'ranks',
                      let: {
                        rank_id: '$rank',
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$rank_id'],
                            },
                          },
                        },
                      ],
                      as: 'rank',
                    },
                  },
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $and: [
                              {
                                $eq: ['$user', '$$user_id'],
                              },
                              {
                                $eq: ['$period', '$$period_id'],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: '$rank',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'network',
              },
            },
            {
              $unwind: {
                path: '$network',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $graphLookup: {
                from: 'users',
                startWith: '$code_upper_head',
                connectFromField: 'code',
                connectToField: 'code_upper_head',
                as: 'ancestors',
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: {
                  user_id: { $toObjectId: '$_id' },
                  period_id: [...id_periods],
                },
                pipeline: [
                  {
                    $lookup: {
                      from: 'ranks',
                      let: {
                        rank_id: '$rank',
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$rank_id'],
                            },
                          },
                        },
                      ],
                      as: 'rank',
                    },
                  },
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $and: [
                              {
                                $eq: ['$user', '$$user_id'],
                              },
                              {
                                $in: ['$period', '$$period_id'],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: '$rank',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'networks',
              },
            },
            {
              $addFields: {
                'network_total.personal_selling': {
                  $sum: {
                    $sum: '$networks.personal_selling',
                  },
                },
                'network_total.tottal_score_order': {
                  $sum: {
                    $sum: '$networks.tottal_score_order',
                  },
                },
                'network_total.tottal_team_score_order': {
                  $sum: {
                    $sum: '$networks.tottal_team_score_order',
                  },
                },
                'network_total.team_selling': {
                  $sum: {
                    $sum: '$networks.tottal_team_score_order',
                  },
                },
              },
            },
            {
              $addFields: {
                sub_length: {
                  $size: '$children',
                },
                sub_total_length: {
                  $size: '$ancestors',
                },
              },
            },
            {
              $project: {
                ancestors: 0,
                children: 0,
              },
            },
          ],
          as: 'children',
        },
      },
      {
        $lookup: {
          from: 'networks',
          let: {
            user_id: { $toObjectId: '$_id' },
            period_id: new ObjectId(period._id),
          },
          pipeline: [
            {
              $lookup: {
                from: 'ranks',
                let: {
                  rank_id: '$rank',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$rank_id'],
                      },
                    },
                  },
                ],
                as: 'rank',
              },
            },
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$user', '$$user_id'],
                        },
                        {
                          $eq: ['$period', '$$period_id'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$rank',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'network',
        },
      },
      {
        $unwind: {
          path: '$network',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'networks',
          let: {
            user_id: { $toObjectId: '$_id' },
            period_id: [...id_periods],
          },
          pipeline: [
            {
              $lookup: {
                from: 'ranks',
                let: {
                  rank_id: '$rank',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$rank_id'],
                      },
                    },
                  },
                ],
                as: 'rank',
              },
            },
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$user', '$$user_id'],
                        },
                        {
                          $in: ['$period', '$$period_id'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$rank',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'networks',
        },
      },
      {
        $graphLookup: {
          from: 'users',
          startWith: '$code_upper_head',
          connectFromField: 'code',
          connectToField: 'code_upper_head',
          as: 'ancestors',
        },
      },
      {
        $addFields: {
          sub_total_length: {
            $size: '$ancestors',
          },
          sub_length: {
            $size: '$children',
          },
        },
      },
      {
        $project: {
          ancestors: 0,
        },
      },
      {
        $addFields: {
          'network_total.personal_selling': {
            $sum: {
              $sum: '$networks.personal_selling',
            },
          },
          'network_total.tottal_score_order': {
            $sum: {
              $sum: '$networks.tottal_score_order',
            },
          },
          'network_total.tottal_team_score_order': {
            $sum: {
              $sum: '$networks.tottal_team_score_order',
            },
          },
          'network_total.team_selling': {
            $sum: {
              $sum: '$networks.tottal_team_score_order',
            },
          },
          networks: [],
        },
      },
    ]);
    return users[0];
  }

  async genrateExcelSkanetUsers(): Promise<any> {}
  async getNetworkUser(user: UserAuth): Promise<any> {
    const start_shamsi = JallaiMoment().locale('fa').startOf('month').format('YYYY-MM-DD HH:mm');
    const end_shamsi = JallaiMoment().locale('fa').endOf('month').format('YYYY-MM-DD HH:mm');
    const start_miladi = JallaiMoment.from(start_shamsi, 'fa', 'YYYY-MM-DD hh:mm')
      .locale('en')
      .format('YYYY-MM-DD HH:mm');
    const end_miladi = JallaiMoment.from(end_shamsi, 'fa', 'YYYY-MM-DD hh:mm').format('YYYY-MM-DD HH:mm');
    const start_miladiISOString = new Date(start_miladi).toISOString();
    const end_miladiISOString = new Date(end_miladi).toISOString();
    const period = await this.periodModel.findOne({
      start_date: start_miladiISOString,
      end_date: end_miladiISOString,
    });
    const networks = await this.networkModel.aggregate([
      {
        $match: {
          user: new ObjectId(user._id),
          period: new ObjectId(period._id),
        },
      },
      {
        $lookup: {
          from: 'ranks',
          localField: 'rank',
          foreignField: '_id',
          as: 'rank',
        },
      },
      {
        $unwind: {
          path: '$rank',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    return {
      network: (networks.length && networks[0]) || null,
    };
  }
  async getNetworkUserById(id: string, user: UserAuth): Promise<any> {
    const start_shamsi = JallaiMoment().locale('fa').startOf('month').format('YYYY-MM-DD hh:mm');
    const end_shamsi = JallaiMoment().locale('fa').endOf('month').format('YYYY-MM-DD hh:mm');
    const start_miladi = JallaiMoment.from(start_shamsi, 'fa', 'YYYY-MM-DD hh:mm')
      .locale('en')
      .format('YYYY-MM-DD hh:mm');
    const end_miladi = JallaiMoment.from(end_shamsi, 'fa', 'YYYY-MM-DD hh:mm').format('YYYY-MM-DD hh:mm');
    const item: UserDocument = await this.getUserWithSubs(new ObjectId(user._id));
    const has_nested = await this.publicUtils.findNested(item.subs, id);
    if (!has_nested) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    const user_item = await this.userModel.findOne({
      _id: id,
    });
    if (!user_item) {
      throw new NotFoundException('آیتمی یافت نشد');
    }

    const network = await this.networkModel
      .findOne({
        user: user_item._id,
        start_date: {
          $gte: start_miladi,
        },
        end_date: {
          $lte: end_miladi,
        },
      })
      .populate('rank');
    return network;
  }

  async getSubsUserByAdmin(id: string, query: QuerySubs): Promise<any> {
    const start_shamsi = JallaiMoment().locale('fa').startOf('month').format('YYYY-MM-DD HH:mm');
    const end_shamsi = JallaiMoment().locale('fa').endOf('month').format('YYYY-MM-DD HH:mm');
    const start_miladi = JallaiMoment.from(start_shamsi, 'fa', 'YYYY-MM-DD hh:mm')
      .locale('en')
      .format('YYYY-MM-DD HH:mm');
    const end_miladi = JallaiMoment.from(end_shamsi, 'fa', 'YYYY-MM-DD hh:mm').format('YYYY-MM-DD HH:mm');
    const start_miladiISOString = new Date(start_miladi).toISOString();
    const end_miladiISOString = new Date(end_miladi).toISOString();
    let period = await this.periodModel.findOne({ start_date: start_miladiISOString, end_date: end_miladiISOString });
    if (query.period) {
      period = await this.periodModel.findOne({ _id: new ObjectId(query.period) });
    }
    const periods = await this.periodModel.find({
      start_date: {
        $lte: new Date(period.start_date),
      },
    });
    const id_periods = periods.map((p) => new ObjectId(p._id));
    const users = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'users',
          let: {
            codeUpperHead: '$code',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$code_upper_head', '$$codeUpperHead'],
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                let: {
                  codeUpperHead: '$code',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$code_upper_head', '$$codeUpperHead'],
                      },
                    },
                  },
                ],
                as: 'children',
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: {
                  user_id: { $toObjectId: '$_id' },
                  period_id: new ObjectId(period._id),
                },
                pipeline: [
                  {
                    $lookup: {
                      from: 'ranks',
                      let: {
                        rank_id: '$rank',
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$rank_id'],
                            },
                          },
                        },
                      ],
                      as: 'rank',
                    },
                  },
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $and: [
                              {
                                $eq: ['$user', '$$user_id'],
                              },
                              {
                                $eq: ['$period', '$$period_id'],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: '$rank',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'network',
              },
            },
            {
              $unwind: {
                path: '$network',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $graphLookup: {
                from: 'users',
                startWith: '$code_upper_head',
                connectFromField: 'code',
                connectToField: 'code_upper_head',
                as: 'ancestors',
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: {
                  user_id: { $toObjectId: '$_id' },
                  period_id: [...id_periods],
                },
                pipeline: [
                  {
                    $lookup: {
                      from: 'ranks',
                      let: {
                        rank_id: '$rank',
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$rank_id'],
                            },
                          },
                        },
                      ],
                      as: 'rank',
                    },
                  },
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $and: [
                              {
                                $eq: ['$user', '$$user_id'],
                              },
                              {
                                $in: ['$period', '$$period_id'],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: '$rank',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'networks',
              },
            },
            {
              $addFields: {
                'network_total.personal_selling': {
                  $sum: {
                    $sum: '$networks.personal_selling',
                  },
                },
                'network_total.tottal_score_order': {
                  $sum: {
                    $sum: '$networks.tottal_score_order',
                  },
                },
                'network_total.tottal_team_score_order': {
                  $sum: {
                    $sum: '$networks.tottal_team_score_order',
                  },
                },
                'network_total.team_selling': {
                  $sum: {
                    $sum: '$networks.tottal_team_score_order',
                  },
                },
              },
            },
            {
              $addFields: {
                sub_length: {
                  $size: '$children',
                },
                sub_total_length: {
                  $size: '$ancestors',
                },
              },
            },
            {
              $project: {
                ancestors: 0,
                children: 0,
              },
            },
          ],
          as: 'children',
        },
      },
      {
        $lookup: {
          from: 'networks',
          let: {
            user_id: { $toObjectId: '$_id' },
            period_id: new ObjectId(period._id),
          },
          pipeline: [
            {
              $lookup: {
                from: 'ranks',
                let: {
                  rank_id: '$rank',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$rank_id'],
                      },
                    },
                  },
                ],
                as: 'rank',
              },
            },
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$user', '$$user_id'],
                        },
                        {
                          $eq: ['$period', '$$period_id'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$rank',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'network',
        },
      },
      {
        $unwind: {
          path: '$network',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'networks',
          let: {
            user_id: { $toObjectId: '$_id' },
            period_id: [...id_periods],
          },
          pipeline: [
            {
              $lookup: {
                from: 'ranks',
                let: {
                  rank_id: '$rank',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$rank_id'],
                      },
                    },
                  },
                ],
                as: 'rank',
              },
            },
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$user', '$$user_id'],
                        },
                        {
                          $in: ['$period', '$$period_id'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$rank',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'networks',
        },
      },
      {
        $graphLookup: {
          from: 'users',
          startWith: '$code_upper_head',
          connectFromField: 'code',
          connectToField: 'code_upper_head',
          as: 'ancestors',
        },
      },
      {
        $addFields: {
          sub_total_length: {
            $size: '$ancestors',
          },
          sub_length: {
            $size: '$children',
          },
        },
      },
      {
        $project: {
          ancestors: 0,
        },
      },
      {
        $addFields: {
          'network_total.personal_selling': {
            $sum: {
              $sum: '$networks.personal_selling',
            },
          },
          'network_total.tottal_score_order': {
            $sum: {
              $sum: '$networks.tottal_score_order',
            },
          },
          'network_total.tottal_team_score_order': {
            $sum: {
              $sum: '$networks.tottal_team_score_order',
            },
          },
          'network_total.team_selling': {
            $sum: {
              $sum: '$networks.tottal_team_score_order',
            },
          },
          networks: [],
        },
      },
    ]);
    return users[0];
  }

  async getParents(id: string) {
    const parents = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $graphLookup: {
          from: 'users',
          startWith: '$code',
          connectFromField: 'code_upper_head',
          connectToField: 'code',
          as: 'ancestors',
        },
      },
      {
        $project: {
          _id: 0,
          // ancestors: {
          //   _id: 1
          // }
        },
      },
    ]);
    const ancestords = parents[0]?.ancestors?.filter(
      (x) => String(x._id) !== String(id) && x.status === statusUser.CONFIRMED,
    );
    const result = ancestords.map((item) => new ObjectId(item._id));
    return result;
  }

  async terminateCooperation(user: UserDocument) {
    const updateResult = await this.userModel
      .updateOne(
        { _id: new ObjectId(user._id) },
        {
          $set: {
            status: 4,
            marketer_code: null,
          },
        },
      )
      .exec();
    if (process.env.NODE_ENV === 'production') {
      if (updateResult.modifiedCount && user.marketer_code) {
        await this.vezaratService.revokeMarketer(user.national_code);
      }
    }

    const fullname = user.first_name + ' ' + user.last_name;
    await this.smsService.sendCooperationTermination(user.mobile, fullname);

    return updateResult;
  }

  //#region SUBS
  async getSubsSasinNetByAdmin(query: QuerySubs) {
    const start_shamsi = JallaiMoment().locale('fa').startOf('month').format('YYYY-MM-DD HH:mm');
    const end_shamsi = JallaiMoment().locale('fa').endOf('month').format('YYYY-MM-DD HH:mm');
    const start_miladi = JallaiMoment.from(start_shamsi, 'fa', 'YYYY-MM-DD hh:mm')
      .locale('en')
      .format('YYYY-MM-DD HH:mm');
    const end_miladi = JallaiMoment.from(end_shamsi, 'fa', 'YYYY-MM-DD hh:mm').format('YYYY-MM-DD HH:mm');
    const start_miladiISOString = new Date(start_miladi).toISOString();
    const end_miladiISOString = new Date(end_miladi).toISOString();
    let period = await this.periodModel.findOne({ start_date: start_miladiISOString, end_date: end_miladiISOString });
    if (query.period) {
      period = await this.periodModel.findOne({ _id: new ObjectId(query.period) });
    }
    const periods = await this.periodModel.find({
      start_date: {
        $lte: new Date(period.start_date),
      },
    });
    const sasinnet = await this.userModel.findOne({ username: 'sasinnet' });

    const id_periods = periods.map((p) => new ObjectId(p._id));
    const users = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(sasinnet._id),
        },
      },
      {
        $lookup: {
          from: 'users',
          let: {
            codeUpperHead: '$code',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$code_upper_head', '$$codeUpperHead'],
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                let: {
                  codeUpperHead: '$code',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$code_upper_head', '$$codeUpperHead'],
                      },
                    },
                  },
                ],
                as: 'children',
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: {
                  user_id: { $toObjectId: '$_id' },
                  period_id: new ObjectId(period._id),
                },
                pipeline: [
                  {
                    $lookup: {
                      from: 'ranks',
                      let: {
                        rank_id: '$rank',
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$rank_id'],
                            },
                          },
                        },
                      ],
                      as: 'rank',
                    },
                  },
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $and: [
                              {
                                $eq: ['$user', '$$user_id'],
                              },
                              {
                                $eq: ['$period', '$$period_id'],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: '$rank',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'network',
              },
            },
            {
              $unwind: {
                path: '$network',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $graphLookup: {
                from: 'users',
                startWith: '$code_upper_head',
                connectFromField: 'code',
                connectToField: 'code_upper_head',
                as: 'ancestors',
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: {
                  user_id: { $toObjectId: '$_id' },
                  period_id: [...id_periods],
                },
                pipeline: [
                  {
                    $lookup: {
                      from: 'ranks',
                      let: {
                        rank_id: '$rank',
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$rank_id'],
                            },
                          },
                        },
                      ],
                      as: 'rank',
                    },
                  },
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $and: [
                              {
                                $eq: ['$user', '$$user_id'],
                              },
                              {
                                $in: ['$period', '$$period_id'],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: '$rank',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'networks',
              },
            },
            {
              $addFields: {
                'network_total.personal_selling': {
                  $sum: {
                    $sum: '$networks.personal_selling',
                  },
                },
                'network_total.tottal_score_order': {
                  $sum: {
                    $sum: '$networks.tottal_score_order',
                  },
                },
                'network_total.tottal_team_score_order': {
                  $sum: {
                    $sum: '$networks.tottal_team_score_order',
                  },
                },
                'network_total.team_selling': {
                  $sum: {
                    $sum: '$networks.tottal_team_score_order',
                  },
                },
              },
            },
            {
              $addFields: {
                sub_length: {
                  $size: '$children',
                },
                sub_total_length: {
                  $size: '$ancestors',
                },
              },
            },
            {
              $project: {
                ancestors: 0,
                children: 0,
              },
            },
          ],
          as: 'children',
        },
      },
      {
        $lookup: {
          from: 'networks',
          let: {
            user_id: { $toObjectId: '$_id' },
            period_id: new ObjectId(period._id),
          },
          pipeline: [
            {
              $lookup: {
                from: 'ranks',
                let: {
                  rank_id: '$rank',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$rank_id'],
                      },
                    },
                  },
                ],
                as: 'rank',
              },
            },
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$user', '$$user_id'],
                        },
                        {
                          $eq: ['$period', '$$period_id'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$rank',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'network',
        },
      },
      {
        $unwind: {
          path: '$network',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'networks',
          let: {
            user_id: { $toObjectId: '$_id' },
            period_id: [...id_periods],
          },
          pipeline: [
            {
              $lookup: {
                from: 'ranks',
                let: {
                  rank_id: '$rank',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$rank_id'],
                      },
                    },
                  },
                ],
                as: 'rank',
              },
            },
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$user', '$$user_id'],
                        },
                        {
                          $in: ['$period', '$$period_id'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$rank',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'networks',
        },
      },
      {
        $graphLookup: {
          from: 'users',
          startWith: '$code_upper_head',
          connectFromField: 'code',
          connectToField: 'code_upper_head',
          as: 'ancestors',
        },
      },
      {
        $addFields: {
          sub_total_length: {
            $size: '$ancestors',
          },
          sub_length: {
            $size: '$children',
          },
        },
      },
      {
        $project: {
          ancestors: 0,
        },
      },
      {
        $addFields: {
          'network_total.personal_selling': {
            $sum: {
              $sum: '$networks.personal_selling',
            },
          },
          'network_total.tottal_score_order': {
            $sum: {
              $sum: '$networks.tottal_score_order',
            },
          },
          'network_total.tottal_team_score_order': {
            $sum: {
              $sum: '$networks.tottal_team_score_order',
            },
          },
          'network_total.team_selling': {
            $sum: {
              $sum: '$networks.tottal_team_score_order',
            },
          },
          networks: [],
        },
      },
    ]);
    return users[0];
  }

  async getUserWithSubs(_id: ObjectId) {
    const result = await this.userModel.aggregate([
      {
        $match: { _id },
      },
      {
        $graphLookup: {
          from: 'users',
          startWith: '$code',
          connectFromField: 'code',
          connectToField: 'code_upper_head',
          as: 'subs',
        },
      },
    ]);
    if (!result?.length) throw new NotFoundException('user notfound');
    const user = result[0];
    user.subs = this.unflattenSubsUsers(user.subs);
    return user;
  }

  private unflattenSubsUsers(list: UserDocument[]) {
    const map = {};
    for (let i = 0; i < list.length; i++) {
      map[list[i].code] = i;
      list[i].subs = [];
    }
    const roots = [];
    for (let j = 0; j < list.length; j++) {
      const node = list[j];
      if (node.code_upper_head && map[node.code_upper_head]) list[map[node.code_upper_head]].subs.push(node);
      else roots.push(node);
    }
    return roots;
  }

  private async generateUniqueCode(): Promise<string> {
    const code = 'sasin' + randomInt(99999999).toString().padStart(8, '0');
    const exists = await this.userModel.findOne({ code });
    if (exists) return await this.generateUniqueCode();
    return code;
  }
  //#endregion
  //#region report
  async userRegistrationReport() {
    return this.userModel.aggregate([
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
            role: '$role',
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
          role: '$_id.role',
          count: 1,
        },
      },
    ]);
  }
  async userStatusReport() {
    return this.userModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);
  }
  async createTestuserByAdmin(body: CreateUserTestDto) {
    const mobile = await this.publicUtils.generateFakePhoneNumber();
    const email = await this.publicUtils.generateFakeEmail();
    const username = await this.publicUtils.generateFakeUsername();
    const national_code = await this.publicUtils.generateFakeNationalCode();

    const has_code_upper_head = await this.userModel.findOne({
      code: body.code_upper_head,
    });
    if (!has_code_upper_head) throw new BadRequestException('code upper head is not exist');

    const has_identification_code = await this.userModel.findOne({
      code: body.identification_code,
    });
    if (!has_identification_code) throw new BadRequestException('code upper head is not exist');
    const new_user = await this.userModel.create({
      email,
      first_name: body.first_name,
      last_name: body.last_name,
      username,
      mobile,
      national_code,
      code_upper_head: body.code_upper_head,
      identification_code: body.identification_code,
      role: [RoleUser.MARKETER],
      status: statusUser.TEST,
    });
    const start_shamsi = JallaiMoment().locale('fa').startOf('month').format('YYYY-MM-DD HH:mm');
    const end_shamsi = JallaiMoment().locale('fa').endOf('month').format('YYYY-MM-DD HH:mm');
    const start_miladi = JallaiMoment.from(start_shamsi, 'fa', 'YYYY-MM-DD hh:mm')
      .locale('en')
      .format('YYYY-MM-DD HH:mm');
    const end_miladi = JallaiMoment.from(end_shamsi, 'fa', 'YYYY-MM-DD hh:mm').format('YYYY-MM-DD HH:mm');
    const start_miladiISOString = new Date(start_miladi).toISOString();
    const end_miladiISOString = new Date(end_miladi).toISOString();
    const period = await this.periodModel.findOne({
      start_date: start_miladiISOString,
      end_date: end_miladiISOString,
    });
    const network = await this.networkModel.findOne({
      user: new ObjectId(new_user._id),
      period: new ObjectId(period._id),
    });
    const rank = await this.rankModel.findOne({
      number_rank: 4,
    });
    if (!network) {
      await this.networkModel.create({
        user: new ObjectId(new_user._id),
        period: new Object(period._id),
        personal_selling: body.personal_selling,
        tottal_score_order: body.tottal_score_order,
        rank: new ObjectId(rank._id),
      });
    } else {
      await this.networkModel.updateOne(
        { _id: network._id },
        {
          personal_selling: body.personal_selling,
          tottal_score_order: body.tottal_score_order,
          rank: new ObjectId(rank._id),
        },
      );
    }
  }
  async getSubsTestUser(id: string, query: QuerySubs) {
    const start_shamsi = JallaiMoment().locale('fa').startOf('month').format('YYYY-MM-DD HH:mm');
    const end_shamsi = JallaiMoment().locale('fa').endOf('month').format('YYYY-MM-DD HH:mm');
    const start_miladi = JallaiMoment.from(start_shamsi, 'fa', 'YYYY-MM-DD hh:mm')
      .locale('en')
      .format('YYYY-MM-DD HH:mm');
    const end_miladi = JallaiMoment.from(end_shamsi, 'fa', 'YYYY-MM-DD hh:mm').format('YYYY-MM-DD HH:mm');
    const start_miladiISOString = new Date(start_miladi).toISOString();
    const end_miladiISOString = new Date(end_miladi).toISOString();
    let period = await this.periodModel.findOne({ start_date: start_miladiISOString, end_date: end_miladiISOString });
    if (query.period) {
      period = await this.periodModel.findOne({ _id: new ObjectId(query.period) });
    }
    const periods = await this.periodModel.find({
      start_date: {
        $lte: new Date(period.start_date),
      },
    });
    const id_periods = periods.map((p) => new ObjectId(p._id));
    const users = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          status: {
            $in: [statusUser.TEST],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          let: {
            codeUpperHead: '$code',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$code_upper_head', '$$codeUpperHead'],
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                let: {
                  codeUpperHead: '$national_code',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$code_upper_head', '$$codeUpperHead'],
                      },
                    },
                  },
                ],
                as: 'children',
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: {
                  user_id: { $toObjectId: '$_id' },
                  period_id: new ObjectId(period._id),
                },
                pipeline: [
                  {
                    $lookup: {
                      from: 'ranks',
                      let: {
                        rank_id: '$rank',
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$rank_id'],
                            },
                          },
                        },
                      ],
                      as: 'rank',
                    },
                  },
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $and: [
                              {
                                $eq: ['$user', '$$user_id'],
                              },
                              {
                                $eq: ['$period', '$$period_id'],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: '$rank',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'network',
              },
            },
            {
              $unwind: {
                path: '$network',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: {
                  user_id: { $toObjectId: '$_id' },
                  period_id: [...id_periods],
                },
                pipeline: [
                  {
                    $lookup: {
                      from: 'ranks',
                      let: {
                        rank_id: '$rank',
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$rank_id'],
                            },
                          },
                        },
                      ],
                      as: 'rank',
                    },
                  },
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $and: [
                              {
                                $eq: ['$user', '$$user_id'],
                              },
                              {
                                $in: ['$period', '$$period_id'],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: '$rank',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'networks',
              },
            },
            {
              $addFields: {
                'network_total.personal_selling': {
                  $sum: {
                    $sum: '$networks.personal_selling',
                  },
                },
                'network_total.tottal_score_order': {
                  $sum: {
                    $sum: '$networks.tottal_score_order',
                  },
                },
                'network_total.tottal_team_score_order': {
                  $sum: {
                    $sum: '$networks.tottal_team_score_order',
                  },
                },
                'network_total.team_selling': {
                  $sum: {
                    $sum: '$networks.tottal_team_score_order',
                  },
                },
              },
            },
            {
              $addFields: {
                sub_length: {
                  $size: '$children',
                },
              },
            },
            {
              $project: {
                children: 0,
              },
            },
          ],
          as: 'children',
        },
      },
      {
        $lookup: {
          from: 'networks',
          let: {
            user_id: { $toObjectId: '$_id' },
            period_id: new ObjectId(period._id),
          },
          pipeline: [
            {
              $lookup: {
                from: 'ranks',
                let: {
                  rank_id: '$rank',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$rank_id'],
                      },
                    },
                  },
                ],
                as: 'rank',
              },
            },
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$user', '$$user_id'],
                        },
                        {
                          $eq: ['$period', '$$period_id'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$rank',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'network',
        },
      },
      {
        $unwind: {
          path: '$network',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'networks',
          let: {
            user_id: { $toObjectId: '$_id' },
            period_id: [...id_periods],
          },
          pipeline: [
            {
              $lookup: {
                from: 'ranks',
                let: {
                  rank_id: '$rank',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$rank_id'],
                      },
                    },
                  },
                ],
                as: 'rank',
              },
            },
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$user', '$$user_id'],
                        },
                        {
                          $in: ['$period', '$$period_id'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$rank',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'networks',
        },
      },
      {
        $addFields: {
          'network_total.personal_selling': {
            $sum: {
              $sum: '$networks.personal_selling',
            },
          },
          'network_total.tottal_score_order': {
            $sum: {
              $sum: '$networks.tottal_score_order',
            },
          },
          'network_total.tottal_team_score_order': {
            $sum: {
              $sum: '$networks.tottal_team_score_order',
            },
          },
          'network_total.team_selling': {
            $sum: {
              $sum: '$networks.tottal_team_score_order',
            },
          },
          networks: [],
        },
      },
    ]);
    return users[0];
  }
  async getSubsUserTest(query: QuerySubs) {
    const start_shamsi = JallaiMoment().locale('fa').startOf('month').format('YYYY-MM-DD HH:mm');
    const end_shamsi = JallaiMoment().locale('fa').endOf('month').format('YYYY-MM-DD HH:mm');
    const start_miladi = JallaiMoment.from(start_shamsi, 'fa', 'YYYY-MM-DD hh:mm')
      .locale('en')
      .format('YYYY-MM-DD HH:mm');
    const end_miladi = JallaiMoment.from(end_shamsi, 'fa', 'YYYY-MM-DD hh:mm').format('YYYY-MM-DD HH:mm');
    const start_miladiISOString = new Date(start_miladi).toISOString();
    const end_miladiISOString = new Date(end_miladi).toISOString();
    let period = await this.periodModel.findOne({ start_date: start_miladiISOString, end_date: end_miladiISOString });
    if (query.period) {
      period = await this.periodModel.findOne({ _id: new ObjectId(query.period) });
    }
    const periods = await this.periodModel.find({
      start_date: {
        $lte: new Date(period.start_date),
      },
    });
    const id_periods = periods.map((p) => new ObjectId(p._id));
    const test = await this.userModel.findOne({ username: 'test' });
    const users = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(test?._id),
          status: {
            $in: [statusUser.TEST],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          let: {
            codeUpperHead: '$code',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$code_upper_head', '$$codeUpperHead'],
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                let: {
                  codeUpperHead: '$national_code',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$code_upper_head', '$$codeUpperHead'],
                      },
                    },
                  },
                ],
                as: 'children',
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: {
                  user_id: { $toObjectId: '$_id' },
                  period_id: new ObjectId(period._id),
                },
                pipeline: [
                  {
                    $lookup: {
                      from: 'ranks',
                      let: {
                        rank_id: '$rank',
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$rank_id'],
                            },
                          },
                        },
                      ],
                      as: 'rank',
                    },
                  },
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $and: [
                              {
                                $eq: ['$user', '$$user_id'],
                              },
                              {
                                $eq: ['$period', '$$period_id'],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: '$rank',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'network',
              },
            },
            {
              $unwind: {
                path: '$network',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: {
                  user_id: { $toObjectId: '$_id' },
                  period_id: [...id_periods],
                },
                pipeline: [
                  {
                    $lookup: {
                      from: 'ranks',
                      let: {
                        rank_id: '$rank',
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$rank_id'],
                            },
                          },
                        },
                      ],
                      as: 'rank',
                    },
                  },
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $and: [
                              {
                                $eq: ['$user', '$$user_id'],
                              },
                              {
                                $in: ['$period', '$$period_id'],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: '$rank',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'networks',
              },
            },
            {
              $addFields: {
                'network_total.personal_selling': {
                  $sum: {
                    $sum: '$networks.personal_selling',
                  },
                },
                'network_total.tottal_score_order': {
                  $sum: {
                    $sum: '$networks.tottal_score_order',
                  },
                },
                'network_total.tottal_team_score_order': {
                  $sum: {
                    $sum: '$networks.tottal_team_score_order',
                  },
                },
                'network_total.team_selling': {
                  $sum: {
                    $sum: '$networks.tottal_team_score_order',
                  },
                },
              },
            },
            {
              $addFields: {
                sub_length: {
                  $size: '$children',
                },
              },
            },
            {
              $project: {
                children: 0,
              },
            },
          ],
          as: 'children',
        },
      },
      {
        $lookup: {
          from: 'networks',
          let: {
            user_id: { $toObjectId: '$_id' },
            period_id: new ObjectId(period._id),
          },
          pipeline: [
            {
              $lookup: {
                from: 'ranks',
                let: {
                  rank_id: '$rank',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$rank_id'],
                      },
                    },
                  },
                ],
                as: 'rank',
              },
            },
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$user', '$$user_id'],
                        },
                        {
                          $eq: ['$period', '$$period_id'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$rank',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'network',
        },
      },
      {
        $unwind: {
          path: '$network',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'networks',
          let: {
            user_id: { $toObjectId: '$_id' },
            period_id: [...id_periods],
          },
          pipeline: [
            {
              $lookup: {
                from: 'ranks',
                let: {
                  rank_id: '$rank',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$rank_id'],
                      },
                    },
                  },
                ],
                as: 'rank',
              },
            },
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$user', '$$user_id'],
                        },
                        {
                          $in: ['$period', '$$period_id'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$rank',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'networks',
        },
      },
      {
        $addFields: {
          'network_total.personal_selling': {
            $sum: {
              $sum: '$networks.personal_selling',
            },
          },
          'network_total.tottal_score_order': {
            $sum: {
              $sum: '$networks.tottal_score_order',
            },
          },
          'network_total.tottal_team_score_order': {
            $sum: {
              $sum: '$networks.tottal_team_score_order',
            },
          },
          'network_total.team_selling': {
            $sum: {
              $sum: '$networks.tottal_team_score_order',
            },
          },
          networks: [],
        },
      },
    ]);
    return users[0];
  }

  async deleteUserTestByAdmin(id: string) {
    const user = await this.userModel.findOne({
      _id: id,
      status: {
        $in: [statusUser.TEST],
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    await this.userModel.deleteOne({ _id: user._id });
  }

  async getBankInfosByAdmin(limit: number = 20, skip: number = 1) {
    limit = Number(limit);
    skip = Number(limit) * Number(Number(skip) - 1);
    const items = await this.userModel
      .find({
        bank_info: {
          $ne: null,
        },
      })
      .limit(limit)
      .skip(skip);
    return {
      items,
      count: items.length,
    };
  }
  //#endregion
}
