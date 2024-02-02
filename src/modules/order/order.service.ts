import { CartSerivce } from './../cart/cart.service';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAuth } from 'src/types/authorization.types';
import { CreateOrderDto } from './dto/createOrder.dto';
import { Order } from './interface/order.interface';
import { PublicUtils } from 'src/utils/public-utils';
import { QueryOrderDto } from './dto/queryOrder.dto';
import { statusOrder } from 'src/types/status.types';
import { QueryOrderByAdmin } from './dto/queryOrderByAdmin.dto';
import { Cart } from '../cart/interface/cart.interface';
import { ApplyCopunOrderDto } from './dto/applyCopunOrder.dto';
import { Copun } from '../copun/interface/copun.interface';
import { UpdateOrder } from './dto/updateOrder.dto';
import { NotificationGateWay } from '../notification/notification.gateway';
import { UpdateOrderByAdmin } from './dto/updateOrderByAdmin.dto';
import { ObjectId } from 'mongodb';
import { Transaction } from '../transaction/interface/transaction.interface';
import { QueryListOrderDto } from './dto/queryListOrder.dto';
import { OrderType } from 'src/types/public.types';
import { AccumulativeReportDto } from './dto/accumulative-report.dto';
import { Admin } from '../admin/schemas/admin.schema';
import { NetworkService } from '../network/network.service';
import * as JallaiMoment from 'jalali-moment';
import { Period } from '../period/interface/period.interface';
import { SettingService } from '../settings/setting.service';
import { dateToJalaliYearMonth } from '@$/utils/mongoose.utils';
import { Address } from '../address/address.schema';
import { networkDocument } from '../network/network.schema';
import { RabbitPublisherService } from '../rabbitmq/rabbit-publisher.service';
import { RoleUser } from '@$/types/role.types';
import axios from 'axios';
import { CategoryService } from '../category/category.serivce';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from '../user/schema/user.schema';
import { OrderDocument } from './order.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('orders') private orderModel: Model<Order>,
    @InjectModel('copuns') private copunModel: Model<Copun>,
    @InjectModel('carts') private cartModel: Model<Cart>,
    @InjectModel('admins') private adminModel: Model<Admin>,
    @InjectModel('transactions') private transactionModel: Model<Transaction>,
    @InjectModel('periods') private periodModel: Model<Period>,
    @InjectModel('addresses') private addressModel: Model<Address>,
    @InjectModel('networks') private networkModel: Model<networkDocument>,
    private readonly cartSerivce: CartSerivce,
    private readonly publicUtils: PublicUtils,
    private readonly notificationGateWay: NotificationGateWay,
    private readonly networkService: NetworkService,
    private readonly settingService: SettingService,
    private readonly rabbitService: RabbitPublisherService,
    private readonly categoryService: CategoryService,
    private readonly configService: ConfigService,
  ) {}
  private readonly logger = new Logger(OrderService.name);
  async createOrder(body: CreateOrderDto, user: UserAuth): Promise<any> {
    const cart = await this.cartSerivce.getCarts(user);
    const code_order = this.publicUtils.generateRandomNumber(6);
    const baskets = cart.items.map((basket: any) => {
      const {
        title_fa,
        title_en,
        description,
        brand,
        category,
        subCategory,
        score,
        tags,
        discount,
        selling_price,
        product_code,
        base_price,
        product_id,
        images,
        release_date,
        inventory,
        slug,
        features,
        weight,
        height,
        width,
        depot,
        price_after_discount,
        count_sales,
        tax,
        final_price,
      } = basket.product;
      return {
        product: {
          title_fa,
          title_en,
          description,
          brand,
          category,
          subCategory: subCategory ? subCategory : '',
          score,
          tags,
          discount,
          selling_price,
          product_code,
          base_price,
          product_id,
          images,
          release_date,
          inventory: inventory || 0,
          slug,
          features,
          weight,
          height,
          width,
          depot,
          price_after_discount,
          count_sales: count_sales ? count_sales : 0,
          tax,
          final_price,
        },
        count: basket.count,
      };
    });
    const ashantions = cart.ashantions.map((ashantion: any) => {
      const {
        title_fa,
        title_en,
        description,
        brand,
        category,
        subCategory,
        score,
        tags,
        discount,
        selling_price,
        product_code,
        base_price,
        product_id,
        images,
        release_date,
        inventory,
        slug,
        features,
        weight,
        height,
        width,
        depot,
        price_after_discount,
        count_sales,
        tax,
        final_price,
      } = ashantion.product;
      return {
        product: {
          title_fa,
          title_en,
          description,
          brand,
          category,
          subCategory: subCategory ? subCategory : '',
          score,
          tags,
          discount,
          selling_price,
          product_code,
          base_price,
          product_id,
          images,
          release_date,
          inventory,
          slug,
          features,
          weight,
          height,
          width,
          depot,
          price_after_discount,
          count_sales: count_sales ? count_sales : 0,
          tax,
          final_price,
        },
        count: ashantion.count,
      };
    });
    const order = await this.orderModel.findOne({
      status: {
        $in: [statusOrder.WAITING_PAYMENT, statusOrder.WAITING_COMPLETION_INFORMATION],
      },
      user: new ObjectId(user._id),
    });
    let address = null;
    const period = await this.networkService.getCurrentPeriod();
    if (body.address_id) {
      const address_item = await this.addressModel.aggregate([
        {
          $match: {
            user: new ObjectId(user._id),
            _id: new ObjectId(body.address_id),
          },
        },
        {
          $lookup: {
            from: 'provinces', // Collection name for cities
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
              $filter: {
                input: '$province.cities',
                cond: {
                  $eq: ['$$this._id', '$city_id'], // Replace with your desired _id value
                },
              },
            },
          },
        },
        {
          $unwind: {
            path: '$province.city',
          },
        },
        {
          $project: {
            first_name: '$first_name',
            last_name: '$last_name',
            mobile: '$mobile',
            postal_code: '$postal_code',
            address: '$address',
            province: {
              _id: '$province._id',
              name: '$province.name',
              city: '$province.city',
            },
          },
        },
      ]);
      address = {
        first_name: address_item[0].first_name,
        last_name: address_item[0].last_name,
        mobile: address_item[0].mobile,
        postal_code: address_item[0].postal_code,
        address: address_item[0].address,
        province: {
          name: address_item[0].province.name,
          city: {
            name: address_item[0].province.city.name,
          },
        },
      };
    }
    const setting = await this.settingService.getSettingByAdmin();
    let price_post = cart?.payDetails?.price_post || 0;
    const priceFreeShipHub = setting?.priceFreeShipHub || []
    if (body.delivery_method === 0) {
      price_post = setting.price_post;
    } else if (body.delivery_method === 1) {
      price_post = 0;
    }
    if (cart.payDetails.payment_amount >= priceFreeShipHub) {
      price_post = 0;
    }
    const { tottal_price_dicount_plan = 0, tottal_tax = 0, copun_price = 0 } = cart?.payDetails;
    const pay_details = {
      ...cart.payDetails,
      price_post,
      payment_amount: tottal_tax + tottal_price_dicount_plan + price_post - copun_price,
    };
    if (!order) {
      const new_order = await this.orderModel.create({
        address,
        baskets,
        code_order,
        user: user._id,
        pay_details,
        status: body.address_id ? statusOrder.WAITING_PAYMENT : statusOrder.WAITING_COMPLETION_INFORMATION,
        delivery_method: body?.delivery_method || 0,
        ashantions,
        period: period?._id ? new ObjectId(period._id) : null,
        depot: body?.depot || null,
      });
      // await this.cartModel.deleteMany({ user: user._id });
      let admins: any = await this.adminModel.find({}, { _id: 1 });
      admins = admins.map((admin) => admin._id);
      await this.notificationGateWay.newNotification({
        message: `یک سفارش توسط ${user.username} ایجاد شده است`,
        receivers: admins,
      });
      return new_order._id;
    }
    return order._id;
  }
  async getOrders(query: QueryOrderDto, user: UserAuth): Promise<any> {
    let { limit = 20, skip = 1 } = query;
    const { order_by, order_type, type } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(Number(skip) - 1);
    const sort = {};
    sort[order_by] = order_type === 'ASC' ? 1 : -1;
    const setting = await this.settingService.getSettingByAdmin();
    let tax = 0;
    if (setting.tax_percent) {
      tax = setting.tax_percent;
    }
    const matchFilter = {
      user: new ObjectId(user._id),
      ...(type !== undefined && {
        status: type,
      }),
    };
    const items = await this.orderModel.aggregate([
      {
        $match: {
          ...matchFilter,
        },
      },
      {
        $lookup: {
          from: 'periods',
          localField: 'period',
          foreignField: '_id',
          as: 'period',
        },
      },
      {
        $unwind: {
          path: '$period',
          preserveNullAndEmptyArrays: true,
        },
      },
      /*
      {
        $lookup: {
          from: 'addresses',
          let: {
            address_id: '$address',
          },
          pipeline: [
            {
              $lookup: {
                from: 'provinces', // Collection name for cities
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
                  $filter: {
                    input: '$province.cities',
                    cond: {
                      $eq: ['$$this._id', '$city_id'], // Replace with your desired _id value
                    },
                  },
                },
              },
            },
            {
              $unwind: {
                path: '$province.city',
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$address_id'],
                },
              },
            },
            {
              $project: {
                first_name: '$first_name',
                last_name: '$last_name',
                mobile: '$mobile',
                postal_code: '$postal_code',
                address: '$address',
                province: {
                  _id: '$province._id',
                  name: '$province.name',
                  city: '$province.city',
                },
              },
            },
          ],
          as: 'address',
        },
      },
      {
        $unwind: {
          path: '$address',
          preserveNullAndEmptyArrays: true,
        },
      },
      */
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
    const count = await this.orderModel.find({ ...matchFilter }).count();
    return {
      items,
      count,
    };
  }
  async getOrder(id: string, user: UserAuth): Promise<any> {
    const setting = await this.settingService.getSettingByAdmin();
    let tax = 0;
    if (setting.tax_percent) {
      tax = setting.tax_percent;
    }
    const items = await this.orderModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          // user: new ObjectId(user._id)
          user: new ObjectId(user._id),
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
      /*
      {
        $addFields: {
          address: {
            $toObjectId: '$address',
          },
        },
      },
      {
        $lookup: {
          from: 'addresses',
          let: {
            address_id: '$address',
          },
          pipeline: [
            {
              $lookup: {
                from: 'provinces', // Collection name for cities
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
                  $filter: {
                    input: '$province.cities',
                    cond: {
                      $eq: ['$$this._id', '$city_id'], // Replace with your desired _id value
                    },
                  },
                },
              },
            },
            {
              $unwind: {
                path: '$province.city',
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$address_id'],
                },
              },
            },
            {
              $project: {
                first_name: '$first_name',
                last_name: '$last_name',
                mobile: '$mobile',
                postal_code: '$postal_code',
                address: '$address',
                province: {
                  _id: '$province._id',
                  name: '$province.name',
                  city: '$province.city',
                },
              },
            },
          ],
          as: 'address',
        },
      },
      {
        $unwind: {
          path: '$address',
          preserveNullAndEmptyArrays: true,
        },
      },
      */
    ]);
    if (!items.length) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return items[0];
  }
  async getOrdersByAdmin(query: QueryOrderByAdmin): Promise<any> {
    let { limit = 20, skip = 1 } = query;
    const {
      order_by,
      order_type,
      delivery_method,
      status,
      status_transaction,
      dateFrom,
      dateTo,
      scoreFrom,
      scoreTo,
      priceFrom,
      priceTo,
      code_order,
    } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(Number(skip) - 1);
    const sort = {};
    sort[order_by] = order_type === 'ASC' ? 1 : -1;
    const match = {
      ...(delivery_method !== undefined && {
        delivery_method,
      }),
      ...(status !== undefined && { status }),
      ...(status_transaction !== undefined && {
        status_transaction,
      }),
      ...((dateFrom || dateTo) && {
        createdAt: {
          ...(dateFrom && { $gte: dateFrom }),
          ...(dateTo && { $lte: dateTo }),
        },
      }),
      ...((scoreFrom || scoreTo) && {
        'pay_details.tottal_score_order': {
          ...(scoreFrom && { $gte: scoreFrom }),
          ...(scoreTo && { $lte: scoreTo }),
        },
      }),
      ...((priceFrom || priceTo) && {
        'pay_details.payment_amount': {
          ...(priceFrom && { $gte: priceFrom }),
          ...(priceTo && { $lte: priceTo }),
        },
      }),
      ...(code_order !== undefined && { code_order }),
    };
    const count = await this.orderModel.find(match).count();
    const items = await this.orderModel.aggregate([
      {
        $match: { ...match, $and: [{ code_order: { $regex: new RegExp(code_order as string), $options: 'i' } }] },
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
                from: 'provinces', // Collection name for cities
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
                  $filter: {
                    input: '$province.cities',
                    cond: {
                      $eq: ['$$this._id', '$city_id'], // Replace with your desired _id value
                    },
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
              $match: {
                $expr: {
                  $eq: ['$_id', '$$user_id'],
                },
              },
            },
            {
              $addFields: {
                'province.cities': 0, // Remove the province.cities field
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
      {
        $lookup: {
          from: 'periods',
          localField: 'period',
          foreignField: '_id',
          as: 'period',
        },
      },
      {
        $unwind: {
          path: '$period',
          preserveNullAndEmptyArrays: true,
        },
      },
      /*
      {
        $addFields: {
          address: {
            $toObjectId: '$address',
          },
        },
      },
      {
        $lookup: {
          from: 'addresses',
          let: {
            address_id: '$address',
          },
          pipeline: [
            {
              $lookup: {
                from: 'provinces', // Collection name for cities
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
                  $filter: {
                    input: '$province.cities',
                    cond: {
                      $eq: ['$$this._id', '$city_id'], // Replace with your desired _id value
                    },
                  },
                },
              },
            },
            {
              $unwind: {
                path: '$province.city',
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$address_id'],
                },
              },
            },
            {
              $project: {
                first_name: '$first_name',
                last_name: '$last_name',
                mobile: '$mobile',
                postal_code: '$postal_code',
                address: '$address',
                province: {
                  _id: '$province._id',
                  name: '$province.name',
                  city: '$province.city',
                },
              },
            },
          ],
          as: 'address',
        },
      },
      {
        $unwind: {
          path: '$address',
          preserveNullAndEmptyArrays: true,
        },
      },
      */
      {
        $group: {
          _id: '$_id',
          period: { $first: '$period' },
          address: { $first: '$address' },
          user: { $first: '$user' },
          createdAt: { $first: '$createdAt' },
          pay_details: { $first: '$pay_details' },
          code_order: { $first: '$code_order' },
          status: { $first: '$status' },
          delivery_method: { $first: '$delivery_method' },
          status_transaction: { $first: '$status_transaction' },
          statusShipping: { $first: '$statusShipping' },
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
    /*
    for (const item of items) {
      let address = item.address;

      if (address && address.province && address.province.city) {
        address = {
          first_name: address.first_name,
          last_name: address.last_name,
          mobile: address.mobile,
          postal_code: address.postal_code,
          address: address.address,
          province: {
            name: address.province.name,
            city: address.province.city,
          },
        };
      } else if (address) {
        address = {
          first_name: address.first_name,
          last_name: address.last_name,
          mobile: address.mobile,
          postal_code: address.postal_code,
          address: address.address,
          province: null,
        };
      }
      const period = item.period?._id ? new ObjectId(item.period._id) : null;
      await this.orderModel.updateOne({ _id: item._id }, { period });
    }
    */

    return {
      items,
      count,
    };
  }
  async getOrderByAdmin(id: string): Promise<any> {
    const orders = await this.orderModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
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
                from: 'provinces', // Collection name for cities
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
                  $filter: {
                    input: '$province.cities',
                    cond: {
                      $eq: ['$$this._id', '$city_id'], // Replace with your desired _id value
                    },
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
              $match: {
                $expr: {
                  $eq: ['$_id', '$$user_id'],
                },
              },
            },
            {
              $addFields: {
                'province.cities': 0, // Remove the province.cities field
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
      /*
      {
        $addFields: {
          address: {
            $toObjectId: '$address',
          },
        },
      },
      {
        $lookup: {
          from: 'addresses',
          let: {
            address_id: '$address',
          },
          pipeline: [
            {
              $lookup: {
                from: 'provinces', // Collection name for cities
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
                  $filter: {
                    input: '$province.cities',
                    cond: {
                      $eq: ['$$this._id', '$city_id'], // Replace with your desired _id value
                    },
                  },
                },
              },
            },
            {
              $unwind: {
                path: '$province.city',
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$address_id'],
                },
              },
            },
            {
              $project: {
                first_name: '$first_name',
                last_name: '$last_name',
                mobile: '$mobile',
                postal_code: '$postal_code',
                address: '$address',
                province: {
                  _id: '$province._id',
                  name: '$province.name',
                  city: '$province.city',
                },
              },
            },
          ],
          as: 'address',
        },
      },
      {
        $unwind: {
          path: '$address',
          preserveNullAndEmptyArrays: true,
        },
      },
      */
      {
        $unwind: '$baskets',
      },
      {
        $addFields: {
          'baskets.product.brand': {
            $toObjectId: '$baskets.product.brand',
          },
        },
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'baskets.product.brand',
          foreignField: '_id',
          as: 'baskets.product.brand',
        },
      },
      {
        $unwind: {
          path: '$baskets.product.brand',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          baskets: { $push: '$baskets' },
          pay_details: {
            $first: '$pay_details',
          },
          user: {
            $first: '$user',
          },
          count_product: {
            $first: '$count_product',
          },
          code_order: {
            $first: '$code_order',
          },
          ashantions: {
            $first: '$ashantions',
          },
          shipment_number: {
            $first: '$shipment_number',
          },
          shipment_tracking_code: {
            $first: '$shipment_tracking_code',
          },
          status: {
            $first: '$status',
          },
          status_transaction: {
            $first: '$status_transaction',
          },
          statusShipping: {
            $first: '$statusShipping',
          },
          createdAt: {
            $first: '$createdAt',
          },
          address: {
            $first: '$address',
          },
          delivery_method: { $first: '$delivery_method' },
        },
      },
    ]);
    if (!orders.length) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    const transactions = await this.transactionModel.find({
      order: id,
    });
    return {
      order: orders[0],
      transactions,
    };
  }
  async deleteOrderByAdmin(id: string): Promise<any> {
    const order = await this.orderModel.findOne({ _id: id });
    if (!order) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.orderModel.deleteOne({ _id: id });
  }
  async applayCopunOrder(body: ApplyCopunOrderDto): Promise<any> {
    const order = await this.orderModel.findOne({ _id: body.order_id });
    if (!order) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    const copun = await this.copunModel.findOne({ name: body.copun });
    if (!copun) {
      throw new BadRequestException('کد تخفیف وارد شده صحیح نمیباشد');
    }
    const hasCopun = await this.copunModel.findOne({
      count_used: {
        $lt: copun.count,
      },
    });
    if (!hasCopun) {
      throw new BadRequestException('کد تخفیف وارد شده صحیح نمیباشد');
    }
    let copun_price = 0;
    if (hasCopun.type === 0) {
      copun_price = Number(hasCopun.value);
    } else if (hasCopun.type === 1) {
      copun_price = (Number(order.pay_details.payment_amount) * Number(hasCopun.value)) / 100;
    } else if (hasCopun.type === 2) {
      copun_price = Number(order.pay_details.product_amount);
    }
    return this.orderModel.updateOne(
      { _id: body.order_id },
      {
        $set: {
          copun: hasCopun._id,
          'pay_details.copun_price': Math.round(copun_price),
          'pay_details.payment_amount': Math.round(order.pay_details.payment_amount - copun_price),
        },
      },
    );
  }
  async deleteCopunOrder(id: string): Promise<any> {
    const order = await this.orderModel.findOne({ _id: id });
    if (!order) {
      throw new NotFoundException('سفارشی یافت نشد');
    }
    return this.orderModel.updateOne(
      { _id: id },
      {
        $set: {
          copun: null,
          'pay_details.payment_amount':
            Math.round(order.pay_details.tottal_price_dicount_plan) +
            Math.round(order.pay_details.tottal_tax) +
            Math.round(order.pay_details.price_post),
        },
      },
    );
  }
  async updateOrder(id: string, body: UpdateOrder, user: UserAuth): Promise<any> {
    const order = await this.orderModel.findOne({
      _id: id,
      user: new ObjectId(user._id),
      status: {
        $in: [statusOrder.WAITING_PAYMENT, statusOrder.WAITING_COMPLETION_INFORMATION],
      },
    });
    const setting = await this.settingService.getSettingByAdmin();
    const priceFreeShipHub = setting?.priceFreeShipHub || 0
    const cart = await this.cartSerivce.getCarts(user);
    const baskets = cart.items.map((basket: any) => {
      const {
        title_fa,
        title_en,
        description,
        brand,
        category,
        subCategory,
        score,
        tags,
        discount,
        selling_price,
        product_code,
        base_price,
        product_id,
        images,
        release_date,
        inventory,
        slug,
        features,
        weight,
        height,
        width,
        depot,
        price_after_discount,
        count_sales,
        tax,
        final_price,
      } = basket.product;
      return {
        product: {
          title_fa,
          title_en,
          description,
          brand,
          category,
          subCategory: subCategory ? subCategory : '',
          score,
          tags,
          discount,
          selling_price,
          product_code,
          base_price,
          product_id,
          images,
          release_date,
          inventory: inventory || 0,
          slug,
          features,
          weight,
          height,
          width,
          depot,
          price_after_discount,
          count_sales: count_sales ? count_sales : 0,
          tax,
          final_price,
        },
        count: basket.count,
      };
    });
    const ashantions = cart.ashantions.map((ashantion: any) => {
      const {
        title_fa,
        title_en,
        description,
        brand,
        category,
        subCategory,
        score,
        tags,
        discount,
        selling_price,
        product_code,
        base_price,
        product_id,
        images,
        release_date,
        inventory,
        slug,
        features,
        weight,
        height,
        width,
        depot,
        price_after_discount,
        count_sales,
        tax,
        final_price,
      } = ashantion.product;
      return {
        product: {
          title_fa,
          title_en,
          description,
          brand,
          category,
          subCategory: subCategory ? subCategory : '',
          score,
          tags,
          discount,
          selling_price,
          product_code,
          base_price,
          product_id,
          images,
          release_date,
          inventory,
          slug,
          features,
          weight,
          height,
          width,
          depot,
          price_after_discount,
          count_sales: count_sales ? count_sales : 0,
          tax,
          final_price,
        },
        count: ashantion.count,
      };
    });
    if (!order) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    let price_post = cart?.payDetails?.price_post || 0;
    if (body.delivery_method === 0) {
      price_post = setting.price_post;
    } else if (body.delivery_method === 1) {
      price_post = 0;
    }
    if (cart.payDetails.payment_amount >= priceFreeShipHub) {
      price_post = 0;
    }
    const { tottal_price_dicount_plan = 0, tottal_tax = 0, copun_price = 0 } = cart?.payDetails;
    const payDetails = {
      ...cart.payDetails,
      price_post,
      payment_amount: tottal_tax + tottal_price_dicount_plan + price_post - copun_price,
    };
    let address = null;
    const period = await this.networkService.getCurrentPeriod();
    if (body.address) {
      const address_item = await this.addressModel.aggregate([
        {
          $match: {
            user: new ObjectId(user._id),
            _id: new ObjectId(body.address),
          },
        },
        {
          $lookup: {
            from: 'provinces', // Collection name for cities
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
              $filter: {
                input: '$province.cities',
                cond: {
                  $eq: ['$$this._id', '$city_id'], // Replace with your desired _id value
                },
              },
            },
          },
        },
        {
          $unwind: {
            path: '$province.city',
          },
        },
        {
          $project: {
            first_name: '$first_name',
            last_name: '$last_name',
            mobile: '$mobile',
            postal_code: '$postal_code',
            address: '$address',
            province: {
              _id: '$province._id',
              name: '$province.name',
              city: '$province.city',
            },
          },
        },
      ]);
      address = {
        first_name: address_item[0].first_name,
        last_name: address_item[0].last_name,
        mobile: address_item[0].mobile,
        postal_code: address_item[0].postal_code,
        address: address_item[0].address,
        province: {
          name: address_item[0].province.name,
          city: {
            name: address_item[0].province.city.name,
          },
        },
      };
    }
    await this.orderModel.updateOne(
      { _id: id },
      {
        ...body,
        pay_details: payDetails,
        baskets,
        ashantions,
        ...(body.address && {
          address,
        }),
        period: period?._id ? new ObjectId(period._id) : null,
        depot: body?.depot || null,
      },
    );
    const new_order = await this.orderModel.findOne({
      _id: id,
      user: user._id,
    });
    if ((new_order.delivery_method === 0 && new_order.address) || new_order.delivery_method === 1) {
      await this.orderModel.updateOne(
        { _id: id },
        {
          status: statusOrder.WAITING_PAYMENT,
        },
      );
    }
    let admins: any = await this.adminModel.find({}, { _id: 1 });
    admins = admins.map((admin) => admin._id);
    return this.notificationGateWay.newNotification({
      message: `یک سفارش با شناسه ${order.code_order} تغییر وضعیت داد`,
      receivers: admins,
    });
  }
  async updateOrderByAdmin(id: string, body: UpdateOrderByAdmin) {
    const order = await this.orderModel.findOne({ _id: id }).populate('user');
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
    if (!order) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    if (body.status === statusOrder.CONFIRMED) {
      if (!order.has_network_calculation) {
        await this.networkService.increasePersonalSelling(order.user, order, period);
        await this.networkService.increaseTeamSelling(order.user, order, period);
        await this.networkService.totalScoreOrder(new ObjectId(order.user._id), order, period);
        await this.networkService.totalTeamScoreOrder(new ObjectId(order.user._id), order, period);
        await this.networkService.rankNetwork(new ObjectId(order.user._id), period);
        await this.networkService.rankTeamNetwork(new ObjectId(order.user._id), period);
      }
      //SEND ORDER TO PLAN
      await this.sendOrderToPlanAndSmart(order as any, order.user as any);
    }

    if (body.status === statusOrder.RETURNED || body.status === statusOrder.CANCELED) {
      if (order.user.role.includes(RoleUser.MARKETER)) {
        //DELETE ORDER GROM PLAN
        console.log('DELETE', this.configService.get('PLAN_URL') + 'order/' + order._id.toString());
        await this.removeOrderFromPlan(order._id.toString());
      }
    }

    await this.orderModel.updateOne(
      { _id: id },
      {
        ...body,
      },
    );
    const networks = await this.networkModel.find({ user: new ObjectId(order.user._id) });

    const tottal_personal_selling = networks.reduce((total, item) => {
      return item.personal_selling + total;
    }, 0);
    if (tottal_personal_selling >= 10000000) {
      this.rabbitService.marketerReachedMinSale(order.user.national_code, order.user.mobile);
    }

    return await this.orderModel.findOne({ _id: order._id });
  }
  async generateOrders() {
    const orders = await this.orderModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
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
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$period',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    return orders;
  }
  async getListOrdersByAdmin(query: QueryListOrderDto) {
    let id_orders = [];
    if (Array.isArray(query.orders)) {
      query.orders.forEach((order) => {
        id_orders.push(new ObjectId(order));
      });
    } else {
      id_orders = [new ObjectId(query.orders)];
    }
    const matchFilter = {
      _id: {
        $in: [...id_orders],
      },
      ...(query.delivery_method !== undefined && {
        delivery_method: query.delivery_method,
      }),
    };
    const orders = await this.orderModel.aggregate([
      {
        $match: {
          ...matchFilter,
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
                from: 'provinces', // Collection name for cities
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
                  $filter: {
                    input: '$province.cities',
                    cond: {
                      $eq: ['$$this._id', '$city_id'], // Replace with your desired _id value
                    },
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
              $match: {
                $expr: {
                  $eq: ['$_id', '$$user_id'],
                },
              },
            },
            {
              $addFields: {
                'province.cities': 0, // Remove the province.cities field
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
      {
        $lookup: {
          from: 'periods',
          let: {
            startDate: '$createdAt',
            endDate: '$createdAt',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $lte: ['$$endDate', '$end_date'],
                    },
                    {
                      $gte: ['$$startDate', '$start_date'],
                    },
                  ],
                },
              },
            },
          ],
          as: 'period',
        },
      },
      {
        $unwind: {
          path: '$period',
          preserveNullAndEmptyArrays: true,
        },
      },
      /*
      {
        $addFields: {
          address: {
            $toObjectId: '$address',
          },
        },
      },
      {
        $lookup: {
          from: 'addresses',
          let: {
            address_id: '$address',
          },
          pipeline: [
            {
              $lookup: {
                from: 'provinces', // Collection name for cities
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
                  $filter: {
                    input: '$province.cities',
                    cond: {
                      $eq: ['$$this._id', '$city_id'], // Replace with your desired _id value
                    },
                  },
                },
              },
            },
            {
              $unwind: {
                path: '$province.city',
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$address_id'],
                },
              },
            },
            {
              $project: {
                first_name: '$first_name',
                last_name: '$last_name',
                mobile: '$mobile',
                postal_code: '$postal_code',
                address: '$address',
                province: {
                  _id: '$province._id',
                  name: '$province.name',
                  city: '$province.city',
                },
              },
            },
          ],
          as: 'address',
        },
      },
      {
        $unwind: {
          path: '$address',
          preserveNullAndEmptyArrays: true,
        },
      },
      */
      // {
      //   $group: {
      //     _id: '$_id',
      //     period: { $first: '$period' },
      //     address: { $first: "$address" },
      //     user: { $first: '$user' },
      //     createdAt: { $first: '$createdAt' },
      //     pay_details: { $first: '$pay_details' },
      //     code_order: { $first: '$code_order' },
      //     status: { $first: '$status' },
      //     delivery_method: { $first: '$delivery_method' },
      //     status_transaction: { $first: '$status_transaction' },

      //   },
      // }
    ]);
    return orders;
  }

  //#region report
  async accumulativeReport(dto: AccumulativeReportDto, exportXlsx = false) {
    const match = {
      status: { $in: dto.status ?? [statusOrder.CONFIRMED] },
      ...(dto.delivery_method !== undefined && {
        delivery_method: dto.delivery_method,
      }),
      ...(dto.status_transaction !== undefined && {
        status_transaction: dto.status_transaction,
      }),
      ...((dto.dateFrom || dto.dateTo) && {
        createdAt: {
          ...(dto.dateFrom && { $gte: dto.dateFrom }),
          ...(dto.dateTo && { $lte: dto.dateTo }),
        },
      }),
    };
    const sort: any = dto.sortBy ? { [dto.sortBy]: dto.sortOrder == OrderType.DESC ? -1 : 1 } : { title_fa: 1 };
    const query = this.orderModel
      .aggregate()
      .collation({ locale: 'en' })
      .match(match)
      .unwind('$baskets')
      .group({
        _id: '$baskets.product.product_code',
        product_id: { $first: '$baskets.product.product_id' },
        title_en: { $first: '$baskets.product.title_en' },
        title_fa: { $first: '$baskets.product.title_fa' },
        slug: { $first: '$baskets.product.slug' },
        images: { $first: '$baskets.product.images' },
        orderCount: { $sum: 1 },
        productCount: { $sum: '$baskets.count' },
        // count_sales: { $sum: '$baskets.product.count_sales' },
        selling_price: { $sum: { $multiply: ['$baskets.product.selling_price', '$baskets.count'] } }, //no tax
        final_price: { $sum: { $multiply: ['$baskets.product.final_price', '$baskets.count'] } }, // tax
        base_price: { $sum: { $multiply: ['$baskets.product.base_price', '$baskets.count'] } }, // خالص
        price_after_discount: { $sum: { $multiply: ['$baskets.product.price_after_discount', '$baskets.count'] } }, // با تخفیف
        discount: { $sum: { $multiply: ['$baskets.product.discount', '$baskets.count'] } }, //  تخفیف
        // ashantions: { $sum: { $size: '$ashantions' } },
        //   otherFields: { $addToSet: '$baskets.product.title_en' },
      })
      .addFields({ product_code: '$_id' })
      .project({
        _id: 0,
      })
      .sort(sort);

    if (!exportXlsx)
      query
        .facet({
          data: [{ $skip: dto.skip ?? 0 }, { $limit: dto.limit ?? 10 }],
          count: [
            {
              $count: 'count',
            },
          ],
        })
        .project({ data: 1, count: { $first: '$count.count' } });

    const result = await query.exec();
    const data = exportXlsx ? result : result[0].data;
    const count = exportXlsx ? -1 : result[0].count;

    const echantillons = await this.orderModel
      .aggregate()
      .match({
        'ashantions.product.product_id': { $in: data.map((x) => x.product_id) },
      })
      .unwind('$ashantions')
      .group({
        _id: '$ashantions.product.product_id',
        productCount: { $sum: '$ashantions.count' },
        count_sales: { $sum: '$ashantions.product.count_sales' },
      })
      .exec();

    return {
      count,
      items: data.map((x) => {
        const echantillon = echantillons.find((echantillon) => echantillon._id === x.product_id);
        x.ashantionsCount = echantillon?.productCount ?? 0;
        x.totalCount = x.productCount + x.ashantionsCount;
        return x;
      }),
    };
  }

  async getOrdersReport() {
    return this.orderModel.aggregate([
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
          paymentAmount: { $sum: '$pay_details.payment_amount' },
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
          paymentAmount: 1,
        },
      },
    ]);
  }

  async FixBugOrder() {
    await this.cartModel.deleteMany({});
    const items = await this.orderModel.aggregate([
      {
        $lookup: {
          from: 'users',
          let: {
            user_id: '$user',
          },
          pipeline: [
            {
              $lookup: {
                from: 'provinces', // Collection name for cities
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
                  $filter: {
                    input: '$province.cities',
                    cond: {
                      $eq: ['$$this._id', '$city_id'], // Replace with your desired _id value
                    },
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
              $match: {
                $expr: {
                  $eq: ['$_id', '$$user_id'],
                },
              },
            },
            {
              $addFields: {
                'province.cities': 0, // Remove the province.cities field
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
      {
        $lookup: {
          from: 'periods',
          let: {
            startDate: '$createdAt',
            endDate: '$createdAt',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $lte: ['$$endDate', '$end_date'],
                    },
                    {
                      $gte: ['$$startDate', '$start_date'],
                    },
                  ],
                },
              },
            },
          ],
          as: 'period',
        },
      },
      {
        $unwind: {
          path: '$period',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          address: {
            $toObjectId: '$address',
          },
        },
      },
      {
        $lookup: {
          from: 'addresses',
          let: {
            address_id: '$address',
          },
          pipeline: [
            {
              $lookup: {
                from: 'provinces', // Collection name for cities
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
                  $filter: {
                    input: '$province.cities',
                    cond: {
                      $eq: ['$$this._id', '$city_id'], // Replace with your desired _id value
                    },
                  },
                },
              },
            },
            {
              $unwind: {
                path: '$province.city',
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$address_id'],
                },
              },
            },
            {
              $project: {
                first_name: '$first_name',
                last_name: '$last_name',
                mobile: '$mobile',
                postal_code: '$postal_code',
                address: '$address',
                province: {
                  _id: '$province._id',
                  name: '$province.name',
                  city: '$province.city',
                },
              },
            },
          ],
          as: 'address',
        },
      },
      {
        $unwind: {
          path: '$address',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          period: { $first: '$period' },
          address: { $first: '$address' },
          user: { $first: '$user' },
          createdAt: { $first: '$createdAt' },
          pay_details: { $first: '$pay_details' },
          code_order: { $first: '$code_order' },
          status: { $first: '$status' },
          delivery_method: { $first: '$delivery_method' },
          status_transaction: { $first: '$status_transaction' },
          statusShipping: { $first: '$statusShipping' },
        },
      },
    ]);

    for (const item of items) {
      let address = item.address;

      if (address && address.province && address.province.city) {
        address = {
          first_name: address.first_name,
          last_name: address.last_name,
          mobile: address.mobile,
          postal_code: address.postal_code,
          address: address.address,
          province: {
            name: address.province.name,
            city: address.province.city,
          },
        };
      } else if (address) {
        address = {
          first_name: address.first_name,
          last_name: address.last_name,
          mobile: address.mobile,
          postal_code: address.postal_code,
          address: address.address,
          province: null,
        };
      }
      const period = item.period?._id ? new ObjectId(item.period?._id) : null;
      await this.orderModel.updateOne({ _id: item._id }, { address, period });
    }
  }
  //#endregion

  async sendOrderToPlanAndSmart(order: OrderDocument, user: UserDocument) {
    if (user.role.includes(RoleUser.MARKETER)) {
      const items = await Promise.all(
        order.baskets.map(async (item) => {
          const category = await this.categoryService.getCategoryById(item.product.category);
          return {
            category: category.name,
            price: item.product.price_after_discount,
            score: item.product.score,
            count: item.count,
          };
        }),
      );
      const result = await axios.post(this.configService.get('PLAN_URL') + 'order', {
        marketerId: user._id,
        price: order.pay_details.tottal_price,
        efectivePrice: order.pay_details.tottal_price_score_order,
        orderId: order._id,
        items,
      });

      for (let i = 0; i < items.length; i++) {
        if (items[i].category === 'ابزار فروش') {
          this.rabbitService.siteOrderCompleted(user.national_code);
        }
      }
      console.log('ORDER ADDED ~~~~~~~~~>', result.data);
    }
  }

  async removeOrderFromPlan(orderId: string) {
    const result = await axios.delete(this.configService.get('PLAN_URL') + 'order/' + orderId);
    console.log('ORDER REMOVED ==============>', result.data);
  }
}
