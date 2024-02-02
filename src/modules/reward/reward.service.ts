import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { RewardType } from 'src/types/public.types';
import { RoleUser } from 'src/types/role.types';
import { statusOrder, statusUser } from 'src/types/status.types';
import { PublicUtils } from 'src/utils/public-utils';
import { Period } from '../period/interface/period.interface';
import { User } from '../user/user.interface';
import { GenreateRewardDto } from './dto/genreateReward.dto';
import { Reward } from './reward.schema';
import { QueryExportExcelRewardByAdmin } from './dto/QueryExportExcelReward.dto';
import { UpdateRewardByAdminDto } from './dto/updateRewardByAdmin.dto';
import { PersonalRewardDto } from './dto/personalReward.dto';
import { Order } from '../order/interface/order.interface';
import { IdentificationRewardDto } from './dto/identificationReward.dto';
import { Network } from '../network/network.interface';
import { UserDocument } from '../user/schema/user.schema';
import { UserService } from '../user/services/user.service';
import { QueryRewardDto } from './dto/query-reward.dto';
import { QueryRewardByAdmin } from './dto/queryReward.dto';
import { dateToJalaliYearMonth } from '@$/utils/mongoose.utils';
import { settingDocument } from '../settings/setting.schema';

@Injectable()
export class RewardService {
  constructor(
    @InjectModel('rewards') private rewardModel: Model<Reward>,
    @InjectModel('networks') private networkModel: Model<Network>,
    @InjectModel('users') private userModel: Model<User>,
    @InjectModel('periods') private periodModel: Model<Period>,
    @InjectModel('orders') private orderModel: Model<Order>,
    @InjectModel('settings') private settingModel: Model<settingDocument>,
    private publicUtils: PublicUtils,
    private userService: UserService,
  ) {}
  async getRewardsByAdmin(query: QueryRewardByAdmin) {
    let { limit = 10, skip = 1 } = query;
    let items: any = [];
    limit = Number(limit);
    skip = Number(limit) * Number(Number(skip) - 1);
    let count = 0;
    let period;
    if (query.period) {
      period = await this.periodModel.findOne({ _id: query.period });
    }
    const sort: any = {
      ...(query.order_by &&
        query.order_type && {
          [query.order_by]: query.order_by,
        }),
    };
    const users = await this.userModel.find({
      status: {
        $ne: statusUser.TEST,
      },
    });
    const users_ids = users.map((user) => new ObjectId(user._id));
    const matchFilters = {
      ...(query.type !== undefined && {
        type: query.type,
      }),
      ...(query.period !== undefined && {
        period: new ObjectId(period._id),
      }),
      ...(query.user !== undefined && {
        user: {
          $in: [new ObjectId(query.user)],
        },
      }),
      ...(query.user == undefined && {
        user: {
          $in: [...users_ids],
        },
      }),
    };

    items = await this.rewardModel.aggregate([
      {
        $match: {
          ...matchFilters,
        },
      },
      {
        $lookup: {
          from: 'users',
          as: 'user',
          localField: 'user',
          foreignField: '_id',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$order',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'periods',
          as: 'period',
          localField: 'period',
          foreignField: '_id',
        },
      },
      {
        $unwind: {
          path: '$period',
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
    count = await this.rewardModel.find(matchFilters).count();
    return {
      items,
      count,
    };
  }
  async getRewardsTestByAdmin(query: QueryRewardByAdmin) {
    let { limit = 10, skip = 1 } = query;
    let items: any = [];
    limit = Number(limit);
    skip = Number(limit) * Number(Number(skip) - 1);
    let count = 0;
    let period;
    if (query.period) {
      period = await this.periodModel.findOne({ _id: query.period });
    }
    const users = await this.userModel.find({
      status: {
        $in: [statusUser.TEST],
      },
    });
    const users_ids = users.map((user) => new ObjectId(user._id));
    const matchFilters = {
      ...(query.type !== undefined && {
        type: query.type,
      }),
      ...(query.period !== undefined && {
        period: new ObjectId(period._id),
      }),
      ...(query.user !== undefined && {
        user: {
          $in: [new ObjectId(query.user)],
        },
      }),
      ...(query.user == undefined && {
        user: {
          $in: [...users_ids],
        },
      }),
    };

    items = await this.rewardModel.aggregate([
      {
        $match: {
          ...matchFilters,
        },
      },
      {
        $lookup: {
          from: 'users',
          as: 'user',
          localField: 'user',
          foreignField: '_id',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$order',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'periods',
          as: 'period',
          localField: 'period',
          foreignField: '_id',
        },
      },
      {
        $unwind: {
          path: '$period',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    count = await this.rewardModel.find(matchFilters).count();
    return {
      items,
      count,
    };
  }

  async getRewardByAdmin(id: string) {
    const reward = await this.rewardModel.findOne({ _id: id });
    return reward;
  }

  async MultiLevelReward(body: GenreateRewardDto) {
    const period = await this.periodModel.findOne({ _id: body.period });
    if (!period) {
      throw new NotFoundException('بازه زمانی یافت نشد');
    }
    const users = await this.userModel.find({
      role: {
        $in: [RoleUser.MARKETER],
      },
      status: {
        $in: [statusUser.CONFIRMED],
      },
    });
    const startOfMonth = period.start_date;
    const endOfMonth = period.end_date;
    if (!users.length) {
      throw new BadRequestException('آیتمی یافت نشد');
    }
    const setting = await this.settingModel.findOne({});
    const level1 = setting?.multiLevelRewardPercentage?.level1 || 0;
    const level2 = setting?.multiLevelRewardPercentage?.level2 || 0;
    const level3 = setting?.multiLevelRewardPercentage?.level3 || 0;
    const level4 = setting?.multiLevelRewardPercentage?.level4 || 0;
    const level5 = setting?.multiLevelRewardPercentage?.level5 || 0;

    const tests = [];
    for (const user_item of users) {
      const user = await this.userModel.aggregate([
        {
          $match: {
            _id: user_item._id,
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
                $lookup: {
                  from: 'networks',
                  let: {
                    user_id: { $toObjectId: '$_id' },
                    period_id: new ObjectId(period._id),
                  },
                  pipeline: [
                    {
                      $addFields: {
                        user: {
                          $toObjectId: '$user',
                        },
                        tottal_price: { $sum: ['$team_selling', '$personal_selling'] },
                      },
                    },
                    {
                      $match: {
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
                    },
                  ],
                  as: 'network',
                },
              },
              {
                $match: {
                  $expr: {
                    $eq: ['$code_upper_head', '$$codeUpperHead'],
                  },
                },
              },
              {
                $unwind: {
                  path: '$network',
                },
              },
              {
                $sort: {
                  'network.tottal_price': -1,
                },
              },
            ],
            as: 'subs',
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
                $addFields: {
                  user: {
                    $toObjectId: '$user',
                  },
                  tottal_price: { $sum: ['$team_selling', '$personal_selling'] },
                },
              },
              {
                $match: {
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
      ]);
      if (user?.length && user[0]?.subs && user[0].subs.length) {
        const base_axios = user[0].subs[0];
        const users = await this.userModel.aggregate([
          {
            $match: {
              _id: base_axios._id,
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
                  $addFields: {
                    level: 2,
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
                        $addFields: {
                          user: {
                            $toObjectId: '$user',
                          },
                          tottal_price: { $sum: ['$team_selling', '$personal_selling'] },
                        },
                      },
                      {
                        $match: {
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
                      },
                    ],
                    as: 'network',
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
                        $addFields: {
                          level: 3,
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
                              $addFields: {
                                user: {
                                  $toObjectId: '$user',
                                },
                                tottal_price: { $sum: ['$team_selling', '$personal_selling'] },
                              },
                            },
                            {
                              $match: {
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
                            },
                          ],
                          as: 'network',
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
                              $addFields: {
                                level: 4,
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
                                    $addFields: {
                                      user: {
                                        $toObjectId: '$user',
                                      },
                                      tottal_price: { $sum: ['$team_selling', '$personal_selling'] },
                                    },
                                  },
                                  {
                                    $match: {
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
                                  },
                                ],
                                as: 'network',
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
                                    $addFields: {
                                      level: 5,
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
                                          $addFields: {
                                            user: {
                                              $toObjectId: '$user',
                                            },
                                            tottal_price: { $sum: ['$team_selling', '$personal_selling'] },
                                          },
                                        },
                                        {
                                          $match: {
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
                                        },
                                      ],
                                      as: 'network',
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
                                          $addFields: {
                                            level: 6,
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
                                                $addFields: {
                                                  user: {
                                                    $toObjectId: '$user',
                                                  },
                                                  tottal_price: { $sum: ['$team_selling', '$personal_selling'] },
                                                },
                                              },
                                              {
                                                $match: {
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
                                              },
                                            ],
                                            as: 'network',
                                          },
                                        },
                                        {
                                          $match: {
                                            $expr: {
                                              $eq: ['$code_upper_head', '$$codeUpperHead'],
                                            },
                                          },
                                        },
                                        {
                                          $unwind: {
                                            path: '$network',
                                          },
                                        },
                                      ],
                                      as: 'subs',
                                    },
                                  },
                                  {
                                    $match: {
                                      $expr: {
                                        $eq: ['$code_upper_head', '$$codeUpperHead'],
                                      },
                                    },
                                  },
                                  {
                                    $unwind: {
                                      path: '$network',
                                    },
                                  },
                                ],
                                as: 'subs',
                              },
                            },
                            {
                              $match: {
                                $expr: {
                                  $eq: ['$code_upper_head', '$$codeUpperHead'],
                                },
                              },
                            },
                            {
                              $unwind: {
                                path: '$network',
                              },
                            },
                          ],
                          as: 'subs',
                        },
                      },
                      {
                        $match: {
                          $expr: {
                            $eq: ['$code_upper_head', '$$codeUpperHead'],
                          },
                        },
                      },
                      {
                        $unwind: {
                          path: '$network',
                        },
                      },
                    ],
                    as: 'subs',
                  },
                },
                {
                  $match: {
                    $expr: {
                      $eq: ['$code_upper_head', '$$codeUpperHead'],
                    },
                  },
                },
                {
                  $unwind: {
                    path: '$network',
                  },
                },
              ],
              as: 'subs',
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
                  $addFields: {
                    user: {
                      $toObjectId: '$user',
                    },
                    tottal_price: { $sum: ['$team_selling', '$personal_selling'] },
                  },
                },
                {
                  $match: {
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
        ]);
        if (users?.length && users[0]?.subs && users[0].subs) {
          const test = this.publicUtils.generateMultiLevelArr(users[0].subs);
          const users_level2 = test.filter((t) => t.level === 2);
          const users_level3 = test.filter((t) => t.level === 3);
          const users_level4 = test.filter((t) => t.level === 4);
          const users_level5 = test.filter((t) => t.level === 5);
          const price_users_level1 = users[0].network.tottal_score_order;
          // const price_users_level1 = users_level1.reduce((total, item) => {
          //     return ((item.network.personal_selling)) + total
          // }, 0)
          let price_users_level2 = 0;
          let price_users_level3 = 0;
          let price_users_level4 = 0;
          let price_users_level5 = 0;
          price_users_level2 = users_level2.reduce((total, item) => {
            return item.network.tottal_score_order + total;
          }, 0);
          price_users_level3 = users_level3.reduce((total, item) => {
            return item.network.tottal_score_order + total;
          }, 0);

          price_users_level4 = users_level4.reduce((total, item) => {
            return item.network.tottal_score_order + total;
          }, 0);
          price_users_level5 = users_level5.reduce((total, item) => {
            return item.network.tottal_score_order + total;
          }, 0);
          const commission =
            (price_users_level1 * level1) / 100 +
            (price_users_level2 * level2) / 100 +
            (price_users_level3 * level3) / 100 +
            (price_users_level4 * level4) / 100 +
            (price_users_level5 * level5) / 100;
          const reward = await this.rewardModel.findOne({
            user: new ObjectId(user_item._id),
            period: new ObjectId(period._id),
            type: RewardType.MULTILEVEL,
          });
          if (
            commission > 0 &&
            user.length &&
            user[0].network?.personal_selling &&
            user[0].network.personal_selling > 1000000
          ) {
            tests.push({
              user: user[0].first_name + user[0].last_name,
              users: users[0].first_name + users[0].last_name,
              personal_selling_users: users[0].network,
              personal_selling_user: user[0]?.network,
              price_users_level1,
              price_users_level2,
              price_users_level3,
              price_users_level4,
              price_users_level5,
              commission: Math.round(commission),
              reward,
              startOfMonth,
              endOfMonth,
            });
            if (!reward) {
              await this.rewardModel.create({
                user: user_item._id,
                period: new ObjectId(period._id),
                price_reward: Math.round(commission),
                type: RewardType.MULTILEVEL,
              });
            } else {
              await this.rewardModel.updateOne(
                {
                  user: user_item._id,
                  period: new ObjectId(period._id),
                  type: RewardType.MULTILEVEL,
                },
                {
                  price_reward: Math.round(commission),
                },
              );
            }
          }
        }
      }
    }
    return tests;
  }
  async generationReward(body: GenreateRewardDto) {
    const period = await this.periodModel.findOne({ _id: body.period });
    if (!period) {
      throw new NotFoundException('بازه زمانی یافت نشد');
    }
    const networks = await this.networkModel.aggregate([
      {
        $match: {
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
      {
        $lookup: {
          from: 'users',
          as: 'user',
          localField: 'user',
          foreignField: '_id',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    const generation_networks = networks.filter(
      (network) => network.personal_selling >= 1000000 && network.rank && network.rank.number_rank >= 5,
    );
    const periods = await this.periodModel.find({
      start_date: {
        $lte: new Date(period.start_date),
      },
    });
    const setting = await this.settingModel.findOne({});
    const level1 = setting?.generationRewardPercentage?.level1 || 0;
    const level2 = setting?.generationRewardPercentage?.level2 || 0;
    const level3 = setting?.generationRewardPercentage?.level3 || 0;
    const level4 = setting?.generationRewardPercentage?.level4 || 0;
    const id_periods = periods.map((p) => new ObjectId(p._id));
    for (const network of generation_networks) {
      const networks = await this.networkModel.find({
        user: new ObjectId(network.user._id),
        period: {
          $in: [...id_periods],
        },
      });
      const totalPersonalSelling = networks.reduce((total, item) => {
        return item.personal_selling + total;
      }, 0);

      const subs = await this.userModel.aggregate([
        {
          $match: {
            code_upper_head: network.user.code,
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
                $addFields: {
                  user: {
                    $toObjectId: '$user',
                  },
                  tottal_price: { $sum: ['$team_selling', '$personal_selling'] },
                },
              },
              {
                $match: {
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
              },
            ],
            as: 'network',
          },
        },
        {
          $unwind: {
            path: '$network',
          },
        },
        {
          $lookup: {
            from: 'ranks',
            let: {
              rank_id: '$network.rank',
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
          $unwind: {
            path: '$rank',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            'network.tottal_price': -1,
          },
        },
      ]);
      let baseUser = null;
      let communalUsers = [];
      if (subs.length) {
        baseUser = subs[0];
      }
      if (baseUser) {
        communalUsers = subs.filter((sub) => sub.network.tottal_price >= 10000000 && sub._id !== baseUser._id);
      }
      let commission = 0;
      let new_subs = [];
      for (let i = 0; i < communalUsers.length; i++) {
        const item: UserDocument = await this.userService.getUserWithSubs(communalUsers[i]._id);
        const subsـcommunalUsers = item?.subs || [];
        const convert_subs = this.publicUtils.convertMutilLevelArr(subsـcommunalUsers);
        for (const sub of convert_subs) {
          let network_sub;
          const networks = await this.networkModel.aggregate([
            {
              $match: {
                user: new ObjectId(sub._id),
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
          if (networks.length) {
            network_sub = networks[0];
          }
          const personal_selling = network_sub?.personal_selling || 0;
          const team_selling = network_sub?.team_selling || 0;
          const totalSales = personal_selling + team_selling;
          const tottal_score_order = network_sub?.tottal_score_order || 0;
          const tottal_team_score_order = network_sub?.tottal_team_score_order || 0;
          const totalScore = tottal_score_order + tottal_team_score_order;
          if (network_sub && network_sub.rank) {
            new_subs.push({
              _id: sub._id,
              username: sub.username,
              network: {
                personal_selling,
                team_selling,
                totalSales,
                tottal_score_order,
                tottal_team_score_order,
                totalScore,
              },
              rank: network_sub?.rank || null,
            });
          }
        }
        if (communalUsers[i]?.rank) {
          new_subs = [
            ...new_subs,
            {
              _id: communalUsers[i]._id,
              username: communalUsers[i].username,
              network: {
                personal_selling: communalUsers[i].network.personal_selling,
                team_selling: communalUsers[i].network.team_selling,
                totalSales: communalUsers[i].network.personal_selling + communalUsers[i].network.team_selling,
                tottal_score_order: communalUsers[i].network.tottal_score_order,
                tottal_team_score_order: communalUsers[i].network.tottal_team_score_order,
                totalScore:
                  communalUsers[i].network.tottal_score_order + communalUsers[0].network.tottal_team_score_order,
              },
              rank: communalUsers[i]?.rank || null,
            },
          ];
        }
        new_subs = new_subs.sort((a, b) => {
          return b.network.totalSales - a.network.totalSales;
        });
        if (network.user && network.rank && network.rank.number_rank) {
          const nearestNumber = this.publicUtils.findClosestAge(new_subs, network.rank.number_rank);
          if (nearestNumber.rank.number_rank) {
            new_subs = new_subs.filter(
              (s) => s.rank?.number_rank && s.rank.number_rank === nearestNumber.rank.number_rank,
            );
            const totalSales = (new_subs.length && new_subs[0].network.totalScore) || 0;
            if (i === 0 && totalPersonalSelling >= 20000000) {
              commission += Math.round((totalSales * level1) / 100);
            }
            if (i === 1 && totalPersonalSelling >= 50000000) {
              commission += Math.round((totalSales * level2) / 100);
            }
            if (i === 2 && totalPersonalSelling >= 80000000) {
              commission += Math.round((totalSales * level3) / 100);
            }
            if (i === 3 && totalPersonalSelling >= 120000000) {
              commission += Math.round((totalSales * level4) / 100);
            }
          }
        }
      }
      if (commission >= 900000000) {
        commission = 900000000;
      }
      if (commission > 0) {
        const reward = await this.rewardModel.findOne({
          period: new ObjectId(period._id),
          type: RewardType.GENERATION,
          user: new ObjectId(network.user._id),
        });
        if (!reward) {
          await this.rewardModel.create({
            period: new ObjectId(period._id),
            user: new ObjectId(network.user._id),
            price_reward: Math.round(commission),
            type: RewardType.GENERATION,
          });
        } else {
          await this.rewardModel.updateOne(
            { period: new ObjectId(period._id), type: RewardType.GENERATION, user: new ObjectId(network.user._id) },
            {
              price_reward: Math.round(commission),
              period: new ObjectId(period._id),
            },
          );
        }
      }
    }
  }

  async exportExcelReward(query: QueryExportExcelRewardByAdmin) {
    const period = await this.periodModel.findOne({ _id: query.period });
    if (!period) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    const items = await this.rewardModel
      .find({
        ...(query.period !== undefined && {
          period: new ObjectId(query.period),
        }),
        period: new ObjectId(period._id),
        ...(query.type !== undefined && {
          type: query.type,
        }),
        ...(query.user !== undefined && {
          user: new ObjectId(query.user),
        }),
      })
      .populate('user')
      .populate('period');
    if (!items.length) {
      throw new NotFoundException('rewards not found');
    }
    return items;
  }

  async deleteReward() {
    return this.rewardModel.deleteMany({
      price_reward: 0,
    });
  }

  async updateRewardByAdmin(id: string, body: UpdateRewardByAdminDto) {
    const reward = await this.rewardModel.findOne({ _id: id });
    if (!reward) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.rewardModel.updateOne(
      { _id: id },
      {
        ...body,
      },
    );
  }

  async deleteRewardByAdmin(id: string) {
    const reward = await this.rewardModel.findOne({ _id: id });
    if (!reward) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.rewardModel.deleteOne({ _id: id });
  }

  async PersonalReward(body: PersonalRewardDto) {
    const period = await this.periodModel.findOne({
      _id: body.period,
    });
    if (!period) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    const orders = await this.orderModel.find({
      createdAt: {
        $gte: period.start_date,
        $lte: period.end_date,
      },
      status: {
        $in: [statusOrder.CONFIRMED],
      },
    });
    for (const order of orders) {
      const orders_user_items = await this.orderModel.find({
        createdAt: {
          $gte: period.start_date,
          $lte: period.end_date,
        },
        user: order.user,
        status: {
          $in: [statusOrder.CONFIRMED],
        },
      });

      const tottal_price = orders_user_items.reduce((total, item) => {
        return item.pay_details.tottal_price + total;
      }, 0);
      let commission = 0;
      const tottal_price_score_order = orders_user_items.reduce((total, item) => {
        return item.pay_details.tottal_price_score_order + total;
      }, 0);

      if (tottal_price > 0 && tottal_price < 50000000) {
        commission = Math.round((tottal_price_score_order * 10) / 100);
      } else if (tottal_price > 50000000 && tottal_price < 150000000) {
        commission = Math.round((tottal_price_score_order * 14) / 100);
      } else if (tottal_price > 150000000) {
        commission = Math.round((tottal_price_score_order * 17) / 100);
      }
      const reward = await this.rewardModel.findOne({
        type: RewardType.PERSONAL,
        user: new ObjectId(order.user as any),
        period: new ObjectId(period._id),
      });
      if (commission > 0) {
        if (!reward) {
          await this.rewardModel.create({
            period: new ObjectId(period._id),
            user: new ObjectId(order.user._id),
            price_reward: Math.round(commission),
            type: RewardType.PERSONAL,
          });
        } else {
          await this.rewardModel.updateOne(
            {
              user: new ObjectId(order.user._id),
              period: new ObjectId(period._id),
              type: RewardType.PERSONAL,
            },
            {
              price_reward: Math.round(commission),
            },
          );
        }
      }
    }
    return orders;
  }

  async identificationReward(body: IdentificationRewardDto) {
    const period = await this.periodModel.findOne({
      _id: body.period,
    });
    if (!period) {
      throw new NotFoundException('آیتمی یافت نشد');
    }

    const orders = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(period.start_date),
            $lte: new Date(period.end_date),
          },
          status: {
            $in: [statusOrder.CONFIRMED],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          let: {
            user_id: '$user',
          },
          pipeline: [
            {
              $lookup: {
                from: 'networks',
                let: {
                  user_id: { $toObjectId: '$_id' },
                  period_id: new ObjectId(period._id),
                },
                pipeline: [
                  {
                    $addFields: {
                      user: {
                        $toObjectId: '$user',
                      },
                      tottal_price: { $sum: ['$team_selling', '$personal_selling'] },
                    },
                  },
                  {
                    $match: {
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
                  },
                ],
                as: 'network',
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$user_id'],
                },
              },
            },
            {
              $unwind: {
                path: '$network',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    for (const order of orders) {
      const tottal_price_score_order = order.pay_details.tottal_price_score_order;

      const identification_users = await this.userModel.aggregate([
        {
          $match: {
            code: order.user.identification_code,
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
                $addFields: {
                  user: {
                    $toObjectId: '$user',
                  },
                  tottal_price: { $sum: ['$team_selling', '$personal_selling'] },
                },
              },
              {
                $match: {
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
      ]);
      const identification = identification_users[0];
      const reward = await this.rewardModel.findOne({
        type: RewardType.IDENTIFICATION,
        order_user: new ObjectId(order.user._id),
        period: new ObjectId(period._id),
      });
      let commission = 0;
      const setting = await this.settingModel.findOne({});
      const identificationRewardPercentage = setting?.identificationRewardPercentage || 0;
      commission = (tottal_price_score_order * identificationRewardPercentage) / 100;
      if (
        commission > 0 &&
        identification?.network?.personal_selling &&
        identification?.network?.personal_selling > 1000000
      ) {
        if (!reward) {
          await this.rewardModel.create({
            period: new ObjectId(period._id),
            user: new ObjectId(identification._id),
            price_reward: Math.round(commission),
            order_user: new ObjectId(order.user._id),
            order: new ObjectId(order._id),
            type: RewardType.IDENTIFICATION,
          });
        }
      }
    }
    return orders;
  }

  async getRewards(userId: string | ObjectId, query: QueryRewardDto) {
    const { period, type } = query;
    let { limit, skip } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(Number(skip) - 1);
    const sort: any = {
      ...(query.order_by &&
        query.order_type && {
          [query.order_by]: query.order_type,
        }),
    };
    const items = await this.rewardModel
      .find({
        user: new ObjectId(userId),
        ...(period !== undefined && {
          period: new ObjectId(period),
        }),
        ...(type !== undefined && {
          type: Number(type),
        }),
      })
      .limit(limit)
      .skip(skip)
      .sort(sort);

    const count = await this.rewardModel
      .find({
        user: new ObjectId(userId),
        ...(period !== undefined && {
          period: new ObjectId(period),
        }),
        ...(type !== undefined && {
          type: Number(type),
        }),
      })
      .count();
    return {
      items,
      count,
    };
  }

  async generationRewardTest(body: GenreateRewardDto) {
    const period = await this.periodModel.findOne({ _id: body.period });
    if (!period) {
      throw new NotFoundException('بازه زمانی یافت نشد');
    }
    const users = await this.userModel.find({
      status: {
        $in: [statusUser.TEST],
      },
    });
    const users_ids = users.map((user) => new ObjectId(user._id));
    const networks = await this.networkModel.aggregate([
      {
        $match: {
          period: new ObjectId(period._id),
          user: {
            $in: [...users_ids],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          as: 'user',
          localField: 'user',
          foreignField: '_id',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    const generation_networks = networks.filter((network) => network.personal_selling >= 1000000);
    const items = [];
    for (const network of generation_networks) {
      const subs = await this.userModel.find({
        code_upper_head: network.user.code,
      });
      const ids_subs = subs.map((sub) => new ObjectId(sub._id));
      const networks = await this.networkModel.find({
        user: {
          $in: [...ids_subs],
        },
        period: new ObjectId(period._id),
      });
      const networks_sort = networks.sort((a, b) => {
        return a.personal_selling - b.personal_selling;
      });
      const communal = networks_sort[networks_sort.length - 1];
      const personal_selling = communal?.personal_selling || 0;
      const team_selling = communal?.team_selling || 0;
      const result = personal_selling + team_selling;
      const reward = await this.rewardModel.findOne({
        type: RewardType.GENERATION,
        user: new ObjectId(network.user._id),
        period: new ObjectId(period._id),
      });
      const commission = (result * 17) / 100;
      if (!reward) {
        await this.rewardModel.create({
          period: new ObjectId(period._id),
          user: new ObjectId(network.user._id),
          price_reward: Math.round(commission),
          type: RewardType.GENERATION,
        });
      } else {
        await this.rewardModel.updateOne(
          { _id: reward._id },
          {
            price_reward: Math.round(commission),
          },
        );
      }
    }
    return items;
  }
  async identificationRewardTest(body: IdentificationRewardDto) {
    const period = await this.periodModel.findOne({ _id: body.period });
    if (!period) {
      throw new NotFoundException('بازه زمانی یافت نشد');
    }
    const users = await this.userModel.find({
      status: {
        $in: [statusUser.TEST],
      },
    });
    const users_ids = users.map((user) => new ObjectId(user._id));
    const networks = await this.networkModel.aggregate([
      {
        $match: {
          period: new ObjectId(period._id),
          user: {
            $in: [...users_ids],
          },
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
      {
        $lookup: {
          from: 'users',
          as: 'user',
          localField: 'user',
          foreignField: '_id',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    for (const network of networks) {
      const users = await this.userModel.find({ identification_code: network.user.code });
      const users_ids = users.map((user) => new ObjectId(user._id));
      const networks = await this.networkModel.find({
        user: {
          $in: [...users_ids],
        },
      });

      const totalPersonalSelling = networks.reduce((total, item) => {
        return item.personal_selling + total;
      }, 0);
      const result = (totalPersonalSelling * 12.5) / 100;
      const reward = await this.rewardModel.findOne({
        period: new ObjectId(period._id),
        user: new ObjectId(network.user._id),
      });
      if (result === 0) return;
      if (!reward) {
        await this.rewardModel.create({
          period: new ObjectId(period._id),
          user: new ObjectId(network.user._id),
          price_reward: Math.round(result),
          type: RewardType.IDENTIFICATION,
        });
      } else {
        await this.rewardModel.updateOne(
          { _id: reward._id },
          {
            price_reward: Math.round(result),
          },
        );
      }
    }
  }
  //#region report
  async rewardsReport() {
    return this.rewardModel.aggregate([
      {
        $group: {
          _id: '$period',
          count: { $sum: 1 },
          total: { $sum: '$price_reward' },
        },
      },
      {
        $lookup: {
          from: 'periods',
          localField: '_id',
          foreignField: '_id',
          as: 'periodLookuped',
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $addFields: {
          periodLookuped: { $arrayElemAt: ['$periodLookuped', 0] },
        },
      },
      {
        $addFields: {
          date: {
            $function: {
              body: dateToJalaliYearMonth,
              args: ['$periodLookuped.start_date'],
              lang: 'js',
            },
          },
          period: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
          periodLookuped: 0,
        },
      },
    ]);
  }
  //#endregion
}
