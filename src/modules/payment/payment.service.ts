import { statusOrder, statusShipping, statusTransaction } from '../../types/status.types';
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ashantion, Order } from '../order/interface/order.interface';
import { InitSamanPaymentDto, PaymentGatewayDto } from './dto/paymentGateway.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { VerifyPaymentDto } from './dto/verifyPayment.dto';
import { Transaction } from '../transaction/interface/transaction.interface';
import { UserAuth } from 'src/types/authorization.types';
import { PublicUtils } from 'src/utils/public-utils';
import { Copun } from '../copun/interface/copun.interface';
import { Product } from '../product/schemas/product.schema';
import { NetworkService } from '../network/network.service';
import { User } from '../user/user.interface';
import * as JallaiMoment from 'jalali-moment';
import { CartSerivce } from '../cart/cart.service';
import { PaymentWay } from 'src/types/public.types';
import { ObjectId } from 'mongodb';
import { Cart } from '../cart/interface/cart.interface';
import { Period } from '../period/interface/period.interface';
import { SmsUtils } from '@$/utils/sm-utils';
import { SamanTransactionService } from '../transaction/services/saman-transaction.service';
import { TransactionStatus } from '../transaction/schemas/saman-transaction.schema';
import { ISamanPaymentCallbackData, SamanGatewayService } from './services/saman-gateway.service';
import { UserDocument } from '../user/schema/user.schema';
import { SettingService } from '../settings/setting.service';
import { CouponService } from '../copun/copun.service';
import { OrderDocument } from '../order/order.schema';
import { networkDocument } from '../network/network.schema';
import { RabbitPublisherService } from '../rabbitmq/rabbit-publisher.service';
import { InventoryHistoriesDocument } from '../inventoryHistories/inventoryHistories.schema';
import { InventoryDocument } from '../inventory/inventory.schema';
import { CategoryService } from '../category/category.serivce';
import { OrderService } from '../order/order.service';

@Injectable()
export class PaymentService {
  constructor(
    private configService: ConfigService,
    private publicUtils: PublicUtils,
    private smsUtils: SmsUtils,
    private networkService: NetworkService,
    @InjectModel('orders') private orderModel: Model<Order>,
    @InjectModel('copuns') private copunModel: Model<Copun>,
    @InjectModel('products') private productModel: Model<Product>,
    @InjectModel('transactions') private transactionModel: Model<Transaction>,
    @InjectModel('users') private userModel: Model<User>,
    @InjectModel('ashantions') private ashantionModel: Model<Ashantion>,
    @InjectModel('carts') private cartModel: Model<Cart>,
    @InjectModel('periods') private periodModel: Model<Period>,
    @InjectModel('networks') private networkModel: Model<networkDocument>,
    @InjectModel('inventories') private inventoryModel: Model<InventoryDocument>,
    @InjectModel('inventoryHistories') private inventoryHistoriesModel: Model<InventoryHistoriesDocument>,
    private cartSerivce: CartSerivce,
    private couponService: CouponService,
    private readonly settingService: SettingService,
    private readonly samanTransactionService: SamanTransactionService,
    private readonly samanGatewayService: SamanGatewayService,
    private readonly rabbitService: RabbitPublisherService,
    private readonly orderService: OrderService,
  ) {}
  async PaymentGateway(body: PaymentGatewayDto, user: UserAuth): Promise<any> {
    const ZARINPAL_BASEURL = this.configService.get<string>('ZARINPAL_BASEURL');
    const ZARINPAL_API_KEY = this.configService.get<string>('ZARINPAL_API_KEY');
    const ZARINPAL_REDIARECT = this.configService.get<string>('ZARINPAL_REDIARECT');
    const PAYMENT_CALLBACK_URL = this.configService.get<string>('PAYMENT_CALLBACK_URL');
    const order: OrderDocument = await this.orderModel
      .findOne({
        _id: body.order_id,
        status: {
          $in: [statusOrder.WAITING_PAYMENT, statusOrder.WAITING_COMPLETION_INFORMATION, statusOrder.WAITING_CONFIRMED],
        },
        user: new ObjectId(user._id),
      })
      .populate('user')
      .populate('copun');
    if (!order) {
      throw new BadRequestException('سفارشی یافت نشد');
    }
    const transactionـcode = await this.publicUtils.generateRandomNumber(6);
    if (order.pay_details.copun_price >= order.pay_details.payment_amount) {
      await this.orderModel.updateOne(
        { _id: body.order_id },
        {
          status: statusOrder.WAITING_CONFIRMED,
          statusShipping: statusShipping.PREPARING,
        },
      );
      await this.transactionModel.create({
        status: statusTransaction.SUCCESS,
        amount: Number(order.pay_details.copun_price),
        baskets: order.baskets,
        user: user._id,
        transactionـcode,
        order: body.order_id,
        payment_way: body.payment_way,
      });
      throw new HttpException('با موفقیت ثبت شد', HttpStatus.OK);
    }
    const httpResponse = await axios.post(
      `${ZARINPAL_BASEURL}/payment/request.json`,
      {
        merchant_id: ZARINPAL_API_KEY,
        amount: order.pay_details.payment_amount,
        callback_url: PAYMENT_CALLBACK_URL,
        description: 'این متن تست است',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (httpResponse.data.data.code !== 100) {
      throw new BadRequestException('خطایی در مرحله پرداخت رخ داده است');
    }
    await this.transactionModel.create({
      status: statusTransaction.AWAITING_PAYMENT,
      amount: Number(order.pay_details.payment_amount) - Number(order.pay_details.copun_price),
      user: user._id,
      transactionـcode,
      authority: httpResponse.data.data.authority,
      order: new ObjectId(body.order_id),
      payment_way: body.payment_way,
    });
    await this.orderModel.updateOne(
      { _id: order._id },
      {
        payment_way: PaymentWay.ZARINPAL,
      },
    );
    await this.cartModel.deleteMany({ user: new ObjectId(user._id) });
    await this.couponService.checkCouponStock(order);
    return `${ZARINPAL_REDIARECT}${httpResponse.data.data.authority}`;
  }
  async VerifyPaymentGateway(body: VerifyPaymentDto, user: UserAuth): Promise<any> {
    const transaction = await this.transactionModel
      .findOne({ authority: body.authority, user: new ObjectId(user._id) })
      .populate('order');
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
    const order: any = await this.orderModel.findOne({
      _id: new ObjectId(transaction.order),
      user: new ObjectId(user._id),
    });
    if (!transaction) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    try {
      const ZARINPAL_BASEURL = this.configService.get<string>('ZARINPAL_BASEURL');
      const ZARINPAL_API_KEY = this.configService.get<string>('ZARINPAL_API_KEY');
      if (!transaction) {
        throw new BadRequestException('تراکنشی یافت نشد');
      }
      const httpResponse = await axios.post(`${ZARINPAL_BASEURL}/payment/verify.json`, {
        merchant_id: ZARINPAL_API_KEY,
        authority: transaction.authority,
        amount: transaction.amount,
      });
      if (httpResponse.data.data.code === 100 || httpResponse.data.data.code === 101) {
        const { data } = httpResponse.data;
        await this.transactionModel.updateOne(
          { authority: body.authority },
          {
            card_hash: data.card_hash,
            card_pan: data.card_pan,
            ref_id: data.ref_id,
            status: statusTransaction.SUCCESS,
          },
        );
        await this.orderModel.updateOne(
          {
            _id: transaction.order,
          },
          {
            status: statusOrder.CONFIRMED,
            statusShipping: statusShipping.PREPARING,
            status_transaction: statusTransaction.SUCCESS,
          },
        );
        await this.smsUtils.sendOrderTrackingUrl(
          user.mobile,
          order.code_order,
          `${this.configService.get('SASINNET_URL')}/profile/orders/${order._id}`,
        );
        await this.smsUtils.sendOrderCreationToAdmins(
          order.code_order,
          `${this.configService.get('SASIN_PANEL_URL')}/sasinnet/order/${order._id}`,
        );
      } else {
        await this.transactionModel.updateOne(
          { authority: body.authority },
          {
            status: statusTransaction.FAILED,
          },
        );
        await this.orderModel.updateOne(
          {
            _id: transaction.order,
          },
          {
            status: statusOrder.WAITING_PAYMENT,
            statusShipping: statusShipping.WAITING_CONFIRMED,
            status_transaction: statusTransaction.FAILED,
          },
        );
      }
    } catch (error) {
      await this.transactionModel.updateOne(
        { authority: body.authority },
        {
          status: statusTransaction.FAILED,
        },
      );
      await this.orderModel.updateOne(
        {
          _id: transaction.order,
        },
        {
          status: statusOrder.WAITING_CONFIRMED,
          statusShipping: statusShipping.WAITING_CONFIRMED,
          status_transaction: statusTransaction.FAILED,
        },
      );
      return transaction._id;
    }
    await this.couponService.checkCouponStock(order);
    await this.couponService.incrementUsageCountCopun(order);
    const networks = await this.networkModel.find({ user: new ObjectId(user._id) });

    const tottal_personal_selling = networks.reduce((total, item) => {
      return item.personal_selling + total;
    }, 0);
    if (tottal_personal_selling >= 10000000) {
      this.rabbitService.marketerReachedMinSale(user.national_code, user.mobile);
    }
    if (order.depot) {
      await this.checkInvenrtory(order);
    }

    for (const ashantion of order.ashantions) {
      const product = await this.productModel.findOne({ slug: ashantion.product.slug });
      let count_sales = ashantion.product.count_sales;
      const ashantion_item: any = await this.ashantionModel.findOne({ product_ashantion: ashantion.product._id });

      let count_used = ashantion_item.count_used;
      let inventory = ashantion.product.inventory;
      if (inventory > 0) {
        inventory -= 1;
      }
      if (product) {
        count_sales += Math.floor(ashantion.count / ashantion_item.ashantion_count);
        count_used += ashantion.count;
        await this.productModel.updateOne(
          { slug: ashantion.product.slug },
          {
            count_sales,
            inventory,
          },
        );
        await this.ashantionModel.updateOne(
          { _id: ashantion_item._id },
          {
            count_used,
          },
        );
      }
    }
    await this.networkService.increasePersonalSelling(user, order, period);
    await this.networkService.increaseTeamSelling(user, order, period);
    await this.networkService.totalScoreOrder(new ObjectId(user._id), order, period);
    await this.networkService.totalTeamScoreOrder(new ObjectId(user._id), order, period);
    await this.networkService.rankNetwork(new ObjectId(user._id), period);
    await this.networkService.rankTeamNetwork(new ObjectId(user._id), period);
    await this.orderModel.updateOne({ _id: order._id }, { has_network_calculation: true });

    //SEND ORDER TO PLAN
    await this.orderService.sendOrderToPlanAndSmart(order, user as any);
  }

  // async PaymentGatewaySaman(body: PaymentGatewayDto, user: UserAuth): Promise<any> {
  //   const order = await this.orderModel.findOne({ _id: body.order_id, user: new ObjectId(user._id) }).populate('user');
  //   if (!order) {
  //     throw new BadRequestException('سفارشی یافت نشد');
  //   }
  //   const transactionـcode = await this.publicUtils.generateRandomNumber(6);
  //   const cart = await this.cartSerivce.getCarts(user);
  //   const baskets = cart.items.map((basket: any) => {
  //     const {
  //       title_fa,
  //       title_en,
  //       description,
  //       brand,
  //       category,
  //       subCategory,
  //       score,
  //       tags,
  //       discount,
  //       selling_price,
  //       product_code,
  //       base_price,
  //       product_id,
  //       images,
  //       release_date,
  //       inventory,
  //       slug,
  //       features,
  //       weight,
  //       height,
  //       width,
  //       depot,
  //       price_after_discount,
  //       count_sales,
  //       tax,
  //       final_price,
  //     } = basket.product;
  //     return {
  //       product: {
  //         title_fa,
  //         title_en,
  //         description,
  //         brand,
  //         category,
  //         subCategory: subCategory ? subCategory : '',
  //         score,
  //         tags,
  //         discount,
  //         selling_price,
  //         product_code,
  //         base_price,
  //         product_id,
  //         images,
  //         release_date,
  //         inventory,
  //         slug,
  //         features,
  //         weight,
  //         height,
  //         width,
  //         depot,
  //         price_after_discount,
  //         count_sales: count_sales ? count_sales : 0,
  //         tax,
  //         final_price,
  //       },
  //       count: basket.count,
  //     };
  //   });
  //   const ashantions = cart.ashantions.map((ashantion: any) => {
  //     const {
  //       title_fa,
  //       title_en,
  //       description,
  //       brand,
  //       category,
  //       subCategory,
  //       score,
  //       tags,
  //       discount,
  //       selling_price,
  //       product_code,
  //       base_price,
  //       product_id,
  //       images,
  //       release_date,
  //       inventory,
  //       slug,
  //       features,
  //       weight,
  //       height,
  //       width,
  //       depot,
  //       price_after_discount,
  //       count_sales,
  //       tax,
  //       final_price,
  //     } = ashantion.product;
  //     return {
  //       product: {
  //         title_fa,
  //         title_en,
  //         description,
  //         brand,
  //         category,
  //         subCategory: subCategory ? subCategory : '',
  //         score,
  //         tags,
  //         discount,
  //         selling_price,
  //         product_code,
  //         base_price,
  //         product_id,
  //         images,
  //         release_date,
  //         inventory,
  //         slug,
  //         features,
  //         weight,
  //         height,
  //         width,
  //         depot,
  //         price_after_discount,
  //         count_sales: count_sales ? count_sales : 0,
  //         tax,
  //         final_price,
  //       },
  //       count: ashantion.count,
  //     };
  //   });
  //   const setting = await this.settingService.getSettingByAdmin();
  //   let price_post = 0;
  //   if (order.delivery_method === 0) {
  //     price_post = setting.price_post;
  //   }
  //   const pay_details = {
  //     ...cart.payDetails,
  //     copun_price: 0,
  //     price_post,
  //   };
  //   const SAMAN_URL = this.configService.get<string>('SAMAN_URL');
  //   const SAMAN_TERMINAL_ID = this.configService.get<string>('SAMAN_TERMINAL_ID');
  //   try {
  //     const httpResponse = await axios.post(
  //       `https://sep.shaparak.ir/OnlinePG/OnlinePG`,
  //       {
  //         Action: 'Token',
  //         TerminalId: SAMAN_TERMINAL_ID,
  //         Amount: cart.payDetails.payment_amount,
  //         ResNum: transactionـcode,
  //         RedirectUrl: 'http://back.sasinplus.ir',
  //         CellNumber: user.mobile,
  //       },
  //       {
  //         // headers: {
  //         //     'Content-Type': 'application/x-www-form-urlencoded'
  //         // }
  //       },
  //     );
  //     return httpResponse;
  //   } catch (error) {
  //     return error;
  //   }
  //   return 'https://url.com';
  // }

  async initSamanPayment(dto: InitSamanPaymentDto, user: UserAuth, userIp?: string) {
    const order = await this.orderModel.findOne({ _id: dto.orderId, user: new ObjectId(user._id) }).populate('user');
    if (!order) {
      throw new BadRequestException('سفارشی یافت نشد');
    }
    const cart = await this.cartSerivce.getCarts(user);
    const setting = await this.settingService.getSettingByAdmin();

    let totalPaymentAmount: number = cart.payDetails.payment_amount;
    if (order.delivery_method === 0) totalPaymentAmount += setting.price_post;

    const transaction = await this.samanTransactionService.createTransaction({
      order: order._id,
      user: new ObjectId(user._id),
      amount: totalPaymentAmount,
      status: TransactionStatus.NEW,
      ip: userIp,
      campaignId: dto.campaignId,
    });

    const tokenResult = await this.samanGatewayService.getToken(
      transaction.amount,
      transaction._id.toString(),
      user.mobile,
    );
    await this.samanTransactionService.updateTransaction(transaction._id, {
      tokenResult,
    });
    return tokenResult;
  }

  async receiveSamanCallbackAndVerify(dto: ISamanPaymentCallbackData): Promise<string> {
    const transaction = await this.samanTransactionService.getTransaction(new ObjectId(dto.ResNum));
    const redirectUrl = transaction.campaignId
      ? `${this.configService.get('PAYMENT_REDIRECT_URL')}/dm/${transaction.campaignId}/${transaction._id}`
      : `${this.configService.get('PAYMENT_REDIRECT_URL')}/${transaction._id}`;

    //#### state 1 => not-successful payment ####
    if (dto.State !== 'OK') {
      await this.samanTransactionService.updateTransaction(transaction._id, {
        status: TransactionStatus.FAILED,
        paymentResult: dto,
      });
      await this.orderFailedSamanPayment(transaction.order);
      return redirectUrl;
    }

    //#### state 2 => already used receipt ####
    const doubleSpent = await this.samanTransactionService.getTransactionByRefNum(dto.RefNum);
    if (doubleSpent) throw new BadRequestException('already used receipt!');

    try {
      //#### state 3 => successful payment ####
      await this.samanTransactionService.updateTransaction(transaction._id, {
        refNum: dto.RefNum,
        status: TransactionStatus.SUCCESS,
        paymentResult: dto,
      });

      // verify ...................
      const verifyResult = await this.samanGatewayService.verifyTransaction(dto.RefNum);
      console.info('verifyTransaction result', verifyResult);

      //#### state 4 => verified payment ####
      if (verifyResult) {
        const updateRes = await this.samanTransactionService.updateTransaction(transaction._id, {
          status: TransactionStatus.VERIFIED,
          verifyResult,
        });
        console.info('updateRes', updateRes);
        await this.orderSuccessSamanPayment(transaction.order, transaction.user);
        return redirectUrl;
      } else {
        //#### state 5 => not verified payment ####
        //  @TODO try again !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        console.warn('!!!!!!! for now manually checked please !!!!!!!');
        return redirectUrl;
      }
    } catch (err) {
      //#### state 5 => reverse payment ####
      console.error('REVERSING due to:', err);
      const reversalResult = await this.samanGatewayService.reverseTransaction(dto.RefNum);
      console.info('REVERSE RESULT', reversalResult);
      await this.samanTransactionService.updateTransaction(transaction._id, {
        status: TransactionStatus.REVERSED,
        reversalResult,
      });
      await this.orderFailedSamanPayment(transaction.order);
      return redirectUrl;
    }
  }

  private async orderSuccessSamanPayment(orderId: ObjectId, userId: ObjectId) {
    const user: UserDocument = await this.userModel.findOne({ _id: userId });
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
    const order: any = await this.orderModel.findOne({
      _id: orderId,
      user: user._id,
    });

    await this.orderModel.updateOne(
      {
        _id: orderId,
      },
      {
        statusShipping: statusShipping.PREPARING,
        status: statusOrder.CONFIRMED,
        status_transaction: statusTransaction.SUCCESS,
      },
    );
    await this.smsUtils.sendOrderTrackingUrl(
      user.mobile,
      order.code_order,
      `${this.configService.get('SASINNET_URL')}/profile/orders/${order._id}`,
    );
    await this.smsUtils.sendOrderCreationToAdmins(
      order.code_order,
      `${this.configService.get('SASIN_PANEL_URL')}/sasinnet/order/${order._id}`,
    );
    if (order.copun) {
      const copun = await this.copunModel.findOne({ _id: order.copun });
      const hasCopun = await this.copunModel.findOne({
        count_used: {
          $lt: copun.count,
        },
      });
      if (copun && hasCopun) {
        await this.copunModel.updateOne(
          { _id: order.copun },
          {
            $set: {
              $inc: {
                count_used: 1,
              },
            },
          },
        );
      }
    }
    const networks = await this.networkModel.find({ user: new ObjectId(user._id) });
    const tottal_personal_selling = networks.reduce((total, item) => {
      return item.personal_selling + total;
    }, 0);
    if (tottal_personal_selling >= 10000000) {
      await this.rabbitService.marketerReachedMinSale(user.national_code, user.mobile);
    }
    if (order.depot) {
      await this.checkInvenrtory(order);
    }
    await this.networkService.increasePersonalSelling(user, order, period);
    await this.networkService.increaseTeamSelling(user, order, period);
    await this.networkService.totalScoreOrder(user._id, order, period);
    await this.networkService.totalTeamScoreOrder(user._id, order, period);
    await this.networkService.rankNetwork(user._id, period);
    await this.networkService.rankTeamNetwork(user._id, period);

    //SEND ORDER TO PLAN
    await this.orderService.sendOrderToPlanAndSmart(order, user);
  }

  private async orderFailedSamanPayment(orderId: ObjectId) {
    await this.orderModel.updateOne(
      {
        _id: orderId,
      },
      {
        status: statusOrder.WAITING_PAYMENT,
        statusShipping: statusShipping.WAITING_CONFIRMED,
        status_transaction: statusTransaction.FAILED,
      },
    );
    return;
  }

  async checkInvenrtory(order: OrderDocument) {
    for (const basket of order.baskets) {
      const product = await this.productModel.findOne({
        slug: basket.product.slug,
      });
      const inventory = await this.inventoryModel.findOne({
        product: new ObjectId(product._id),
        depot: new ObjectId(order.depot),
      });
      if (!inventory) return;
      const countProduct = inventory.countProduct;
      await this.inventoryModel.updateOne(
        { _id: inventory._id },
        {
          $inc: {
            countUsed: basket.count,
          },
          countProduct: Number(countProduct) - Number(basket.count),
        },
      );
      await this.inventoryHistoriesModel.create({
        depot: new ObjectId(order.depot),
        product: new ObjectId(product._id),
        order: new ObjectId(order._id),
        inventoryDecline: basket.count,
        finalInventory: Number(countProduct) - Number(basket.count),
      });
    }
    for (const basket of order.ashantions) {
      const product = await this.productModel.findOne({
        slug: basket?.product?.slug,
      });
      const inventory = await this.inventoryModel.findOne({
        product: new ObjectId(product._id),
        depot: new ObjectId(order.depot),
      });
      if (!inventory) return;
      const countProduct = inventory.countProduct;
      await this.inventoryModel.updateOne(
        { _id: inventory._id },
        {
          $inc: {
            countUsed: basket.count,
          },
          countProduct: Number(countProduct) - Number(basket.count),
        },
      );
      await this.inventoryHistoriesModel.create({
        depot: new ObjectId(order.depot),
        product: new ObjectId(product._id),
        order: new ObjectId(order._id),
        inventoryDecline: basket.count,
        finalInventory: Number(countProduct) - Number(basket.count),
      });
    }
  }
}
