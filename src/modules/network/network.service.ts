import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { statusOrder, statusUser } from 'src/types/status.types';
import { Order } from '../order/order.schema';
import { Network } from './network.interface';
import { PublicUtils } from 'src/utils/public-utils';
import { Rank } from '../rank/interface/rank.interface';
import { ObjectId } from 'mongodb';
import 'moment-timezone';
import * as JallaiMoment from 'jalali-moment';
import { UpdateNetworkUserByAdmin } from './dto/updateNetworkUserByAdmin.dto';
import { QueryNetwork } from './dto/queryNetwork.dto';
import { Period } from '../period/interface/period.interface';
import { RoleUser } from 'src/types/role.types';
import { QueryPeriodDto } from './dto/queryPeriod.dto';
import { periodDocument } from '../period/period.schema';
import { UserDocument } from '../user/schema/user.schema';
import { networkDocument } from './network.schema';
import { UserService } from '../user/services/user.service';
import { UserAuth } from '@$/types/authorization.types';
import { RabbitPublisherService } from '../rabbitmq/rabbit-publisher.service';

@Injectable()
export class NetworkService {
  constructor(
    @InjectModel('orders') private orderModel: Model<Order>,
    @InjectModel('users') private userModel: Model<UserDocument>,
    @InjectModel('networks') private networkModel: Model<Network>,
    @InjectModel('ranks') private rankModel: Model<Rank>,
    @InjectModel('periods') private periodModel: Model<Period>,
    private readonly userService: UserService,
    private publicUtils: PublicUtils,
    private readonly rabbitService: RabbitPublisherService,
  ) {}

  async getCurrentPeriod() {
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
    if (!period) throw new InternalServerErrorException('current period not found!');
    return period;
  }

  async getCurrentPersonalSelling(userId: ObjectId | string) {
    const period = await this.getCurrentPeriod();
    const network: networkDocument = await this.networkModel.findOne({
      user: new ObjectId(userId),
      period: period._id,
    });
    return network?.personal_selling ?? 0;
  }

  // async personalSelling(userId: ObjectId, order: any, period: any) {
  //   const network = await this.networkModel.findOne({
  //     user: new ObjectId(userId),
  //     period: new ObjectId(period._id),
  //   });
  //   const personal_selling = order.pay_details.tottal_price;
  //   if (network) {
  //     await this.networkModel.updateOne(
  //       {
  //         user: new ObjectId(userId),
  //         period: new ObjectId(period._id),
  //       },
  //       {
  //         $inc: {
  //           personal_selling: Math.round(personal_selling),
  //         },
  //       },
  //     );
  //   }
  // }
  // async teamSelling(userId: ObjectId, order, period: any): Promise<any> {
  //   const parents = await this.getParents(userId.toString());
  //   const personal_selling = order.pay_details.tottal_price;
  //   await this.networkModel.updateMany(
  //     {
  //       user: {
  //         $in: [...parents],
  //       },
  //       period: new ObjectId(period._id),
  //     },
  //     {
  //       $inc: {
  //         team_selling: Math.round(personal_selling),
  //       },
  //     },
  //   );
  // }

  async increasePersonalSelling(buyer: UserAuth | UserDocument, order: any, period: any) {
    // find MARKETER
    let userId: ObjectId;
    if (buyer.role.includes(RoleUser.MARKETER)) userId = new ObjectId(buyer._id);
    else {
      const marketer: UserDocument = await this.userModel.findOne({ code: buyer.identification_code });
      userId = marketer._id;
    }

    const network = await this.networkModel.findOne({
      user: userId,
      period: new ObjectId(period._id),
    });
    const personal_selling = order.pay_details.tottal_price;
    if (network) {
      await this.networkModel.updateOne(
        {
          user: userId,
          period: new ObjectId(period._id),
        },
        {
          $inc: {
            personal_selling: Math.round(personal_selling),
          },
        },
      );
    }
  }
  async increaseTeamSelling(buyer: UserAuth | UserDocument, order, period: any): Promise<any> {
    // find MARKETER
    let userId: ObjectId;
    if (buyer.role.includes(RoleUser.MARKETER)) userId = new ObjectId(buyer._id);
    else {
      const marketer: UserDocument = await this.userModel.findOne({ code: buyer.identification_code });
      userId = marketer._id;
    }

    const parents = await this.getParents(userId.toString());
    const personal_selling = order.pay_details.tottal_price;
    await this.networkModel.updateMany(
      {
        user: {
          $in: [...parents],
        },
        period: new ObjectId(period._id),
      },
      {
        $inc: {
          team_selling: Math.round(personal_selling),
        },
      },
    );
  }

  // async totalTeamScoreOrder(user: UserAuth, order, period) {
  //   // const parents = await this.getParents(user._id);
  //   // let total_score_order = order.pay_details.tottal_price_score_order;
  //   // await this.networkModel.updateMany(
  //   //   {
  //   //     user: {
  //   //       $in: [...parents],
  //   //     },
  //   //     period: new ObjectId(period._id),
  //   //   },
  //   //   {
  //   //     $inc: {
  //   //       tottal_team_score_order: Math.round(total_score_order),
  //   //     },
  //   //   },
  //   // );
  // }
  async totalTeamScoreOrder(userId: ObjectId, order, period) {
    const parents = await this.getParents(userId.toString());
    const total_score_order = order.pay_details.tottal_price_score_order;
    await this.networkModel.updateMany(
      {
        user: {
          $in: [...parents],
        },
        period: new ObjectId(period._id),
      },
      {
        $inc: {
          tottal_team_score_order: Math.round(total_score_order),
        },
      },
    );
  }
  async rankNetwork(userId: ObjectId, period: any) {
    await this.calculateRankUserById(userId, period);
  }
  async rankTeamNetwork(userId: ObjectId, period: any) {
    const parents = await this.getParents(userId.toString());
    for (const parent of parents) {
      const user_item: UserDocument = await this.userModel.findOne({ _id: new ObjectId(parent) });
      await this.calculateRankUserById(user_item._id, period);
    }
  }

  async getNetworksByAdmin(query: QueryNetwork) {
    const { user } = query;
    let items = [];
    let count = 0;
    let matcHFilters = {};
    if (user) {
      matcHFilters = {
        ...matcHFilters,
        user: new ObjectId(user),
      };
    }
    if (query.period) {
      const period = await this.periodModel.findOne({ _id: query.period });
      if (!period) {
        throw new NotFoundException('آیتمی یافت نشد');
      }
      matcHFilters = {
        ...matcHFilters,
        period: new ObjectId(period._id),
      };
    }
    items = await this.networkModel.find(matcHFilters).populate({
      path: 'user',
      model: 'users',
      select: {
        _id: 1,
        first_name: 1,
        last_name: 1,
        mobile: 1,
        username: 1,
        email: 1,
        status: 1,
        role: 1,
      },
    });
    count = await this.networkModel.find(matcHFilters).count();
    return {
      items,
      count,
    };
  }

  async getNetworkByAdmin(id: string) {
    const network = await this.networkModel.findOne({ _id: id });
    if (!network) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return network;
  }

  async updateNetworkByAdmin(id: string, body: UpdateNetworkUserByAdmin) {
    const network = await this.networkModel.findOne({ _id: id });
    if (!network) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.networkModel.updateOne(
      { _id: id },
      {
        ...body,
      },
    );
  }

  async deleteNetworkByAdmin(id: string) {
    const network = await this.networkModel.findOne({ _id: id });
    if (!network) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.networkModel.deleteOne({ _id: id });
  }

  async personalSellingByAdmin(body: QueryPeriodDto) {
    const period = await this.periodModel.findOne({ _id: body.period });
    if (!period) {
      throw new NotFoundException('دوره زمانی یافت نشد');
    }
    const users = await this.userModel.find({
      role: {
        $in: [RoleUser.MARKETER],
      },
      status: {
        $in: [statusUser.CONFIRMED],
      },
    });
    for (const user of users) {
      const identifications = await this.userModel.find({
        identification_code: user.code,
        role: RoleUser.CUSTOMER,
      });
      const identifications_ids = identifications.map((item) => new ObjectId(item._id));
      const orders = await this.orderModel.find({
        period: new ObjectId(period._id),
        status: {
          $in: [statusOrder.CONFIRMED],
        },
        $or: [
          {
            user: new ObjectId(user._id),
          },
          {
            user: {
              $in: [...identifications_ids],
            },
          },
        ],
      });

      const tottal_price = orders.reduce((total, item) => {
        return item.pay_details.tottal_price + total;
      }, 0);

      const network = await this.networkModel.findOne({
        user: new ObjectId(user._id),
        period: new ObjectId(period._id),
      });
      if (network) {
        await this.networkModel.updateOne(
          { _id: network._id },
          {
            personal_selling: Math.round(tottal_price),
          },
        );
      }
      for (const order of orders) {
        const has_network_calculation = await this.orderModel.findOne({ has_network_calculation: true });
        if (!has_network_calculation) {
          await this.orderModel.updateOne(
            { _id: order._id },
            {
              has_network_calculation: true,
            },
          );
        }
      }
      const total_networks = await this.networkModel.find({
        user: new ObjectId(user._id),
      });
      const tottal_personal_selling = total_networks.reduce((total, item) => {
        return item.personal_selling + total;
      }, 0);
      if (tottal_personal_selling >= 10000000) {
        this.rabbitService.marketerReachedMinSale(user.national_code, user.mobile);
      }
    }
  }

  async teamSellingByAdmin(body: QueryPeriodDto) {
    const period = await this.periodModel.findOne({ _id: body.period });
    if (!period) {
      throw new NotFoundException('دوره زمانی یافت نشد');
    }

    const users = await this.userModel.aggregate([
      {
        $match: {
          role: {
            $in: [RoleUser.MARKETER],
          },
          status: {
            $in: [statusUser.CONFIRMED, statusUser.TEST],
          },
        },
      },
    ]);
    for (const user of users) {
      const user_item: UserDocument = await this.userService.getUserWithSubs(user._id);
      const subs = user_item.subs;
      const items = this.publicUtils.convertGenerationArr(subs);
      const id_items = items.map((item) => new ObjectId(item._id));
      const networks = await this.networkModel.find({
        period: new ObjectId(period._id),
        user: {
          $in: [...id_items],
        },
      });

      const tottal_price_perosnal_selling = networks.reduce((total, item) => {
        const personal_selling = item?.personal_selling || 0;
        return personal_selling + total;
      }, 0);

      const network = await this.networkModel.findOne({
        user: new ObjectId(user._id),
        period: new ObjectId(period._id),
      });
      if (network) {
        await this.networkModel.updateOne(
          { _id: network._id },
          {
            team_selling: Math.round(tottal_price_perosnal_selling),
          },
        );
      }
    }
  }

  async scoreOrderByAdmin(body: QueryPeriodDto) {
    const period = await this.periodModel.findOne({ _id: body.period });
    if (!period) {
      throw new NotFoundException('دوره زمانی یافت نشد');
    }
    const users = await this.userModel.find({
      role: {
        $in: [RoleUser.MARKETER],
      },
      status: {
        $in: [statusUser.CONFIRMED],
      },
    });
    for (const user of users) {
      const identifications = await this.userModel.find({
        identification_code: user.code,
        role: RoleUser.CUSTOMER,
      });
      const identifications_ids = identifications.map((item) => new ObjectId(item._id));
      const orders = await this.orderModel.find({
        $or: [
          {
            user: new ObjectId(user._id),
          },
          {
            user: {
              $in: [...identifications_ids],
            },
          },
        ],
        period: new ObjectId(period._id),
        createdAt: {
          $gte: new Date(period.start_date),
          $lte: new Date(period.end_date),
        },
        status: {
          $in: [statusOrder.CONFIRMED],
        },
      });

      const tottal_price = orders.reduce((total, item) => {
        return item.pay_details.tottal_price_score_order + total;
      }, 0);

      const network = await this.networkModel.findOne({
        user: new ObjectId(user._id),
        period: new ObjectId(period._id),
      });
      if (network) {
        await this.networkModel.updateOne(
          { _id: network._id },
          {
            tottal_score_order: Math.round(tottal_price),
          },
        );
      }
    }
  }
  async totalScoreOrder(userId: ObjectId, order, period: any) {
    const network = await this.networkModel.findOne({
      user: new ObjectId(userId),
      period: new ObjectId(period._id),
    });
    const total_score_order = order.pay_details.tottal_price_score_order;
    if (network) {
      await this.networkModel.updateOne(
        { _id: network._id },
        {
          $inc: {
            tottal_score_order: Math.round(total_score_order),
          },
        },
      );
    }
  }
  async totalTeamScoreOrderByAdmin(body: QueryPeriodDto) {
    const period = await this.periodModel.findOne({ _id: body.period });
    if (!period) {
      throw new NotFoundException('دوره زمانی یافت نشد');
    }

    const users = await this.userModel.aggregate([
      {
        $match: {
          role: {
            $in: [RoleUser.MARKETER],
          },
          status: {
            $in: [statusUser.CONFIRMED, statusUser.TEST],
          },
        },
      },
    ]);
    for (const user of users) {
      const user_item: UserDocument = await this.userService.getUserWithSubs(user._id);
      const items = this.publicUtils.convertGenerationArr(user_item.subs);
      const id_items = items.map((item) => new ObjectId(item._id));
      const networks = await this.networkModel.find({
        period: new ObjectId(period._id),
        user: {
          $in: [...id_items],
        },
      });
      const tottal_team_score_order = networks.reduce((total, item) => {
        const personal_selling = item?.tottal_score_order || 0;
        return personal_selling + total;
      }, 0);

      const network = await this.networkModel.findOne({
        user: new ObjectId(user._id),
        period: new ObjectId(period._id),
      });
      if (network) {
        await this.networkModel.updateOne(
          { _id: network._id },
          {
            tottal_team_score_order: Math.round(tottal_team_score_order),
          },
        );
      }
    }
  }
  async calculateRankByAdmin(body: QueryPeriodDto) {
    const period: periodDocument = await this.periodModel.findOne({ _id: body.period });
    const tests = [];
    if (!period) {
      throw new NotFoundException('آیتمی یافت نشد');
    }

    const users = await this.userModel.find().sort({
      createdAt: -1,
    });
    // return monthAgoString
    for (const user_item of users) {
      // await this.calculateRankUserById(user_item, period);
      await this.calculateRankUserById(new ObjectId(user_item._id), period);
    }
    return tests;
  }
  async calculateRankUserById(userId: ObjectId, period: periodDocument) {
    const startDate = new Date(period.start_date);
    const oneMonthAgo = new Date(
      startDate.getFullYear(),
      startDate.getMonth() - 1,
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes(),
      startDate.getSeconds(),
      startDate.getMilliseconds(),
    );
    const period_before = await this.periodModel.findOne({
      start_date: oneMonthAgo.toISOString(),
    });
    const periods = await this.periodModel.find({
      start_date: {
        $lte: new Date(period.start_date),
      },
    });
    const id_periods = periods.map((p) => new ObjectId(p._id));
    const user: UserDocument = await this.userService.getUserWithSubs(new ObjectId(userId));
    const network = await this.networkModel.findOne({
      user: new ObjectId(userId),
      period: new ObjectId(period._id),
    });
    const subs = await this.publicUtils.generateMultiLevelArr(user.subs);
    const new_subs = [];
    let subs_axis = [];
    for (const sub of subs) {
      let network;
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
        network = networks[0];
      }
      const personal_selling = network?.personal_selling || 0;
      const team_selling = network?.team_selling || 0;
      const totalSales = personal_selling + team_selling;
      new_subs.push({
        _id: sub._id,
        username: sub.username,
        network: {
          personal_selling,
          team_selling,
          totalSales,
        },
        rank: network?.rank || null,
      });
      const has_axis_subs = user.subs.some((s) => s._id === sub._id);
      if (has_axis_subs) {
        subs_axis.push({
          _id: sub._id,
          username: sub.username,
          network: {
            personal_selling,
            team_selling,
            totalSales,
          },
          rank: network?.rank || null,
        });
      }
    }
    subs_axis = subs_axis.sort((a, b) => {
      if (a.network.totalSale > b.network.totalSale) {
        return a.network.totalSales - b.network.totalSales;
      } else {
        return b.network.totalSales - a.network.totalSales;
      }
    });
    let baseUser = null;
    if (subs_axis.length) {
      const items = subs_axis.filter((sub) => sub.network.totalSales > 0);
      if (items.length) {
        baseUser = items[0];
      }
    }
    let communalUsers = [];
    if (baseUser) {
      communalUsers = subs_axis.filter((sub) => sub.network.totalSales >= 10000000 && sub._id !== baseUser._id);
    }
    const complementUsers = subs_axis.filter((sub) => sub.network.totalSales >= 7000000 && sub.totalSales < 10000000);
    const supplementUsers = subs_axis.filter((sub) => sub.network.totalSales >= 5000000 && sub.totalSales < 7000000);
    const finalUsers = subs_axis.filter((sub) => sub.network.totalSales >= 3000000 && sub.totalSales < 5000000);
    const count_axis = user?.subs?.length || 0;
    const teamSelling = network?.team_selling || 0;
    const networks = await this.networkModel.find({
      user: new ObjectId(user._id),
      period: {
        $in: [...id_periods],
      },
    });
    const totalPersonalSelling = networks.reduce((total, item) => {
      return item.personal_selling + total;
    }, 0);
    let rankNumber = this.calculateNumberRank(
      totalPersonalSelling,
      count_axis,
      baseUser,
      communalUsers,
      complementUsers,
      supplementUsers,
      finalUsers,
      teamSelling,
      new_subs,
    );
    let newtwork_before = [];
    if (period_before) {
      newtwork_before = await this.networkModel.aggregate([
        {
          $match: {
            period: new ObjectId(period_before._id),
            user: new ObjectId(user._id),
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
    }
    if (
      newtwork_before.length &&
      newtwork_before[0].rank &&
      newtwork_before[0].rank.number_rank &&
      rankNumber <= newtwork_before[0].rank.number_rank &&
      newtwork_before[0].rank.number_rank > 0 &&
      newtwork_before[0].rank.number_rank <= 4
    ) {
      rankNumber = newtwork_before[0].rank.number_rank;
    }

    if (
      (newtwork_before.length &&
        newtwork_before[0].rank &&
        newtwork_before[0].rank.number_rank &&
        newtwork_before[0].rank.number_rank > 4 &&
        rankNumber < newtwork_before[0].rank.number_rank &&
        rankNumber <= 4) ||
      (newtwork_before.length &&
        newtwork_before[0].rank &&
        newtwork_before[0].rank.number_rank >= 4 &&
        network.personal_selling < 1000000)
    ) {
      rankNumber = 4;
    }
    const rank = await this.rankModel.findOne({ number_rank: rankNumber });
    if (rank) {
      await this.networkModel.updateOne(
        { user: new ObjectId(user._id), period: new ObjectId(period._id) },
        {
          rank: rank._id,
        },
      );
    } else {
      await this.networkModel.updateOne(
        { user: new ObjectId(user._id), period: new ObjectId(period._id) },
        {
          rank: '',
        },
      );
    }
  }
  calculateNumberRank(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    let rankNumber = 1;
    if (
      this.isRahbar3(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 19;
    } else if (
      this.isRahbar2(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 18;
    } else if (
      this.isRahbar1(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 17;
    } else if (
      this.isRahbar(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 16;
    } else if (
      this.isMorabi2(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 15;
    } else if (
      this.isMorabi1(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 14;
    } else if (
      this.isMorabi(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 13;
    } else if (
      this.isMoshaver3(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 12;
    } else if (
      this.isMoshaver2(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 11;
    } else if (
      this.isMoshaver1(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 10;
    } else if (
      this.isMoshaver(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 9;
    } else if (
      this.isHami3(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 8;
    } else if (
      this.isHami2(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 7;
    } else if (
      this.isHami1(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 6;
    } else if (
      this.isHami(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
        new_subs,
      )
    ) {
      rankNumber = 5;
    } else if (
      this.isStarter(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
      )
    ) {
      rankNumber = 4;
    } else if (
      this.isNoamoz2(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
      )
    ) {
      rankNumber = 3;
    } else if (
      this.isNoamoz1(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
      )
    ) {
      rankNumber = 2;
    } else if (
      this.isMobtadi(
        totalPersonalSelling,
        count_axis,
        baseUser,
        communalUsers,
        complementUsers,
        supplementUsers,
        finalUsers,
        teamSelling,
      )
    ) {
      rankNumber = 1;
    } else {
      rankNumber = 0;
    }
    return rankNumber;
  }
  isRahbar3(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ): boolean {
    const has_rank_number_18 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 18);
    if (
      totalPersonalSelling >= 120000000 &&
      count_axis >= 5 &&
      teamSelling >= 4500000000 &&
      has_rank_number_18 &&
      baseUser &&
      communalUsers.length &&
      complementUsers.length &&
      supplementUsers.length &&
      finalUsers.length
    ) {
      return true;
    }
  }
  isRahbar2(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    const has_rank_number_17 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 17);
    if (
      totalPersonalSelling >= 120000000 &&
      count_axis >= 5 &&
      teamSelling >= 3500000000 &&
      has_rank_number_17 &&
      baseUser &&
      communalUsers.length &&
      communalUsers.length &&
      complementUsers.length &&
      supplementUsers.length &&
      finalUsers.length
    ) {
      return true;
    }
  }
  isRahbar1(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    const has_rank_number_16 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 16);
    if (
      totalPersonalSelling >= 120000000 &&
      count_axis >= 5 &&
      teamSelling >= 2500000000 &&
      has_rank_number_16 &&
      baseUser &&
      communalUsers.length &&
      complementUsers.length &&
      supplementUsers.length &&
      finalUsers.length
    ) {
      return true;
    }
  }
  isRahbar(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    const has_rank_number_15 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 15);
    if (
      totalPersonalSelling >= 120000000 &&
      count_axis >= 5 &&
      teamSelling >= 2000000000 &&
      has_rank_number_15 &&
      baseUser &&
      communalUsers.length &&
      complementUsers.length &&
      supplementUsers.length &&
      finalUsers.length
    ) {
      return true;
    }
  }
  isMorabi2(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    const has_rank_number_14 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 14);
    if (
      totalPersonalSelling >= 80000000 &&
      count_axis >= 4 &&
      teamSelling >= 1500000000 &&
      has_rank_number_14 &&
      baseUser &&
      communalUsers.length &&
      complementUsers.length &&
      supplementUsers.length
    ) {
      return true;
    }
  }
  isMorabi1(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    const has_rank_number_13 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 13);
    if (
      totalPersonalSelling >= 80000000 &&
      count_axis >= 4 &&
      teamSelling >= 800000000 &&
      has_rank_number_13 &&
      baseUser &&
      communalUsers.length &&
      complementUsers.length &&
      supplementUsers.length
    ) {
      return true;
    }
  }
  isMorabi(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    const has_rank_number_12 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 12);
    if (
      totalPersonalSelling >= 80000000 &&
      count_axis >= 4 &&
      teamSelling >= 500000000 &&
      has_rank_number_12 &&
      baseUser &&
      communalUsers.length &&
      complementUsers.length &&
      supplementUsers.length
    ) {
      return true;
    }
  }
  isMoshaver3(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    const has_rank_number_11 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 11);
    if (
      totalPersonalSelling >= 50000000 &&
      count_axis >= 3 &&
      teamSelling >= 300000000 &&
      has_rank_number_11 &&
      baseUser &&
      communalUsers.length &&
      communalUsers.length
    ) {
      return true;
    }
  }
  isMoshaver2(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    const has_rank_number_10 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 10);
    if (
      totalPersonalSelling >= 50000000 &&
      count_axis >= 3 &&
      teamSelling >= 150000000 &&
      has_rank_number_10 &&
      baseUser &&
      communalUsers.length &&
      communalUsers.length
    ) {
      return true;
    }
  }
  isMoshaver1(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    const has_rank_number_9 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 9);
    if (
      totalPersonalSelling >= 50000000 &&
      count_axis >= 3 &&
      teamSelling >= 90000000 &&
      has_rank_number_9 &&
      baseUser &&
      communalUsers.length &&
      communalUsers.length
    ) {
      return true;
    }
  }
  isMoshaver(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    const has_rank_number_8 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 8);
    if (
      totalPersonalSelling >= 20000000 &&
      count_axis >= 2 &&
      teamSelling >= 50500000 &&
      has_rank_number_8 &&
      baseUser &&
      (communalUsers.length || complementUsers.length)
    ) {
      return true;
    }
  }
  isHami3(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    const has_rank_number_7 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 7);
    if (
      totalPersonalSelling >= 20000000 &&
      count_axis >= 2 &&
      teamSelling >= 30500000 &&
      has_rank_number_7 &&
      baseUser &&
      (communalUsers.length || complementUsers.length)
    ) {
      return true;
    }
  }

  isHami2(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    const has_rank_number_6 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 6);
    if (
      totalPersonalSelling >= 20000000 &&
      count_axis >= 2 &&
      teamSelling >= 20000000 &&
      has_rank_number_6 &&
      baseUser &&
      (communalUsers.length || complementUsers.length)
    ) {
      return true;
    }
  }
  isHami1(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    const has_rank_number_5 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 5);
    if (
      totalPersonalSelling >= 20000000 &&
      count_axis >= 2 &&
      teamSelling >= 10500000 &&
      has_rank_number_5 &&
      baseUser &&
      (communalUsers.length || complementUsers.length)
    ) {
      return true;
    }
  }
  isHami(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
    new_subs,
  ) {
    const has_rank_number_4 = new_subs.some((sub) => sub.rank && sub.rank.number_rank && sub.rank.number_rank === 4);
    if (
      totalPersonalSelling >= 20000000 &&
      count_axis >= 1 &&
      teamSelling >= 10000000 &&
      has_rank_number_4 &&
      baseUser
    ) {
      return true;
    }
  }
  isStarter(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
  ) {
    if (totalPersonalSelling >= 20000000 && count_axis >= 0 && teamSelling >= 0) {
      return true;
    }
  }
  isNoamoz2(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
  ) {
    if (totalPersonalSelling >= 5000000 && count_axis >= 0 && teamSelling >= 0) {
      return true;
    }
  }
  isNoamoz1(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
  ) {
    if (totalPersonalSelling >= 3000000 && count_axis >= 0 && teamSelling >= 0) {
      return true;
    }
  }
  isMobtadi(
    totalPersonalSelling: number,
    count_axis: number,
    baseUser: any,
    communalUsers: any[],
    complementUsers: any[],
    supplementUsers: any[],
    finalUsers: any[],
    teamSelling: number,
  ) {
    if (totalPersonalSelling >= 1000000 && count_axis >= 0 && teamSelling >= 0) {
      return true;
    }
  }
  async calculateNetworkByAdmin(body: QueryPeriodDto) {
    const period = await this.periodModel.findOne({ _id: new ObjectId(body.period) });
    if (!period) {
      throw new NotFoundException('');
    }
    const users = await this.userModel.aggregate([
      {
        $match: {
          status: {
            $in: [statusUser.CONFIRMED],
          },
          role: {
            $in: [RoleUser.MARKETER],
          },
          createdAt: {
            $lte: new Date(period.end_date),
          },
        },
      },
    ]);
    for (const user of users) {
      const network = await this.networkModel.findOne({
        period: new ObjectId(period._id),
        user: new ObjectId(user._id),
      });
      if (!network) {
        await this.networkModel.create({
          period: new ObjectId(period._id),
          user: new ObjectId(user._id),
        });
      }
    }
    return users;
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
}
