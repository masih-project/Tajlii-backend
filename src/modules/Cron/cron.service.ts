/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Rank } from './../rank/rank.schema';
import { Length } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model, Types } from 'mongoose';
import { statusOrder, statusPeriod, statusTransaction, statusUser } from 'src/types/status.types';
import { Network } from '../network/network.interface';
import { Order } from '../order/order.schema';
import { User } from '../user/user.interface';
import { PublicUtils } from 'src/utils/public-utils';
import { Reward } from '../reward/reward.interface';
import 'moment-timezone';
import * as JallaiMoment from 'jalali-moment';
import { Period } from '../period/interface/period.interface';
import { Transaction } from '../transaction/interface/transaction.interface';
import { RoleUser } from '@$/types/role.types';
import { ObjectId } from 'mongodb';

@Injectable()
export class CronService {
  constructor(
    @InjectModel('orders') private orderModel: Model<Order>,
    @InjectModel('transactions') private transactionModel: Model<Transaction>,
    @InjectModel('users') private userModel: Model<User>,
    @InjectModel('networks') private networkModel: Model<Network>,
    @InjectModel('rewards') private rewardModel: Model<Reward>,
    @InjectModel('ranks') private rankModel: Model<Rank>,
    @InjectModel('periods') private periodModel: Model<Period>,
    private publicUtils: PublicUtils,
  ) {}
  async onCronOrder() {
    const orders = await this.orderModel.find({
      status: {
        $in: [statusOrder.WAITING_COMPLETION_INFORMATION, statusOrder.WAITING_PAYMENT],
      },
    });
    for (const order of orders) {
      //@ts-ignore
      const datetime = new Date(order.createdAt);
      datetime.setHours(datetime.getHours() + 6);
      const date_today = new Date();
      if (datetime < date_today) {
        // await this.orderModel.deleteOne({ _id: order._id });
        await this.orderModel.updateOne(
          { _id: order._id },
          {
            status: statusOrder.DELETED,
          },
        );
      }
    }
  }
  async generateNetwork() {
    const start_shamsi = JallaiMoment().locale('fa').startOf('month').format('YYYY-MM-DD HH:mm');
    const end_shamsi = JallaiMoment().locale('fa').endOf('month').format('YYYY-MM-DD HH:mm');
    const start_miladi = JallaiMoment.from(start_shamsi, 'fa', 'YYYY-MM-DD hh:mm')
      .locale('en')
      .format('YYYY-MM-DD HH:mm');
    const end_miladi = JallaiMoment.from(end_shamsi, 'fa', 'YYYY-MM-DD hh:mm').format('YYYY-MM-DD HH:mm');
    const start_miladiISOString = new Date(start_miladi).toISOString();
    const end_miladiISOString = new Date(end_miladi).toISOString();
    const start_shamsi_monthAgo = JallaiMoment()
      .locale('fa')
      .subtract(1, 'month')
      .startOf('month')
      .format('YYYY-MM-DD HH:mm');
    const end_shamsi_monthAgo = JallaiMoment()
      .locale('fa')
      .subtract(1, 'month')
      .endOf('month')
      .format('YYYY-MM-DD HH:mm');
    const start_miladi_monthAgo = JallaiMoment.from(start_shamsi_monthAgo, 'fa', 'YYYY-MM-DD hh:mm')
      .locale('en')
      .format('YYYY-MM-DD HH:mm');
    const end_miladi_monthAgo = JallaiMoment.from(end_shamsi_monthAgo, 'fa', 'YYYY-MM-DD hh:mm').format(
      'YYYY-MM-DD HH:mm',
    );
    const start_miladiISOString_monthAgo = new Date(start_miladi_monthAgo).toISOString();
    const end_miladiISOString_monthAgo = new Date(end_miladi_monthAgo).toISOString();
    const period = await this.periodModel.findOne({
      start_date: start_miladiISOString,
      end_date: end_miladiISOString,
    });
    const period_before = await this.periodModel.findOne({
      start_date: start_miladiISOString_monthAgo,
      end_date: end_miladiISOString_monthAgo,
    });
    if (period) {
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
        const networks_before = await this.networkModel.aggregate([
          {
            $match: {
              user: new ObjectId(user._id),
              period: new ObjectId(period_before._id),
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
        let number_rank = 0;
        if (
          networks_before.length &&
          networks_before[0].rank &&
          networks_before[0].rank.number_rank &&
          networks_before[0].rank.number_rank >= 4 &&
          period_before
        ) {
          number_rank = 4;
        } else if (
          networks_before.length &&
          networks_before[0].rank &&
          networks_before[0].rank.number_rank &&
          networks_before[0].rank.number_rank >= 1 &&
          networks_before[0].rank.number_rank < 4 &&
          period_before
        ) {
          number_rank = networks_before[0].rank.number_rank;
        }
        const rank = await this.rankModel.findOne({
          number_rank,
        });
        if (!network) {
          await this.networkModel.create({
            period: new ObjectId(period._id),
            user: new ObjectId(user._id),
            rank: rank ? rank._id : null,
          });
        }
      }
    }
  }

  async createPeriod() {
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
    if (!period) {
      await this.periodModel.create({
        start_date: start_miladiISOString,
        end_date: end_miladiISOString,
        status: statusPeriod.AWAITING_PAYMENT,
      });
    }
  }

  async onCronTransaction() {
    const transactions = await this.transactionModel.find({
      status: {
        $in: [statusTransaction.AWAITING_PAYMENT],
      },
    });
    for (const transaction of transactions) {
      ///@ts-ignore
      const datetime = new Date(transaction.createdAt);
      datetime.setHours(datetime.getHours() + 1);
      const date_today = new Date();
      if (datetime < date_today) {
        // await this.orderModel.deleteOne({ _id: order._id });
        await this.transactionModel.deleteOne({ _id: transaction._id });
      }
    }
  }
}
