import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAuth } from 'src/types/authorization.types';
import { Cart, cartDocument } from './cart.schema';
import { CreateCart } from './dto/createCart.dto';
import * as _ from 'lodash';
import { statusOrder } from 'src/types/status.types';
import { Ashantion } from '../ashantion/ashantion.interface';
import { ObjectId } from 'mongodb';
import { Product } from '../product/schemas/product.schema';
import { Order } from '../order/order.schema';
import { SettingService } from '../settings/setting.service';
import { UserDocument } from '../user/schema/user.schema';
//=============================================================================

@Injectable()
export class CartSerivce {
  constructor(
    @InjectModel('carts') private cartModel: Model<cartDocument>,
    @InjectModel('products') private productModel: Model<Product>,
    @InjectModel('orders') private orderModel: Model<Order>,
    @InjectModel('ashantions') private ashantionModel: Model<Ashantion>,
    private readonly settingService: SettingService,
  ) {}
  async createCart(body: CreateCart, user: UserAuth, session_id: string): Promise<any> {
    const product = await this.productModel.findOne({
      _id: body.product_id,
    });
    if (!product) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    if (product.inventory === 0) {
      throw new BadRequestException('کالا موردنظر موجود نمیباشد');
    }
    const cartUser = await this.cartModel.findOne({
      ...(user !== undefined && {
        user: new ObjectId(user._id),
      }),
      ...(user == undefined && {
        session_id,
      }),
    });
    const cart = await this.cartModel.findOne({
      ...(user !== undefined && {
        user: new ObjectId(user._id),
      }),
      ...(user == undefined && {
        session_id,
      }),
      'items.product': new ObjectId(body.product_id),
    });
    if (!cartUser) {
      await this.cartModel.create({
        session_id,
        user: user?._id || '',
        items: {
          product: new ObjectId(body.product_id),
          count: 1,
        },
      });
    } else if (!cart) {
      await this.cartModel.updateOne(
        {
          ...(user !== undefined && {
            user: new ObjectId(user._id),
          }),
          ...(user == undefined && {
            session_id,
          }),
        },
        {
          $push: {
            items: {
              product: new ObjectId(body.product_id),
              count: body.count ? body.count : 1,
            },
          },
        },
      );
    } else {
      await this.cartModel.updateOne(
        { _id: cart._id, 'items.product': new ObjectId(body.product_id) },
        {
          $inc: {
            'items.$.count': body.count ? body.count : 1,
          },
        },
      );
    }
    // if (cart) {
    //   await this.cartModel.updateOne(
    //     { _id: cart._id, 'items.product': new ObjectId(body.product_id) },
    //     {
    //       $inc: {
    //         'items.$.count': body.count ? body.count : 1,
    //       },
    //     },
    //   );
    // } else {
    //   await this.cartModel.create({
    //     session_id,
    //     user: user?._id || '',
    //     items: {
    //       product: new ObjectId(body.product_id),
    //       count: 1,
    //     },
    //   });
    // }
    const order = await this.orderModel.findOne({
      status: {
        $in: [statusOrder.WAITING_COMPLETION_INFORMATION, statusOrder.WAITING_PAYMENT],
      },
    });
    if (order) {
      const cart_item: any = this.getCarts(user, session_id);
      const payDetails = {
        ...cart_item.payDetails,
        price_post: order.pay_details.price_post,
      };
      return this.orderModel.updateOne(
        { _id: order._id },
        {
          baskets: cart_item.items,
          ashantions: cart_item.ashantions,
          pay_details: payDetails,
        },
      );
    }
  }
  async deleteCart(product_id: string, user: UserAuth, session_id: string): Promise<any> {
    const cart = await this.cartModel.findOne({
      ...(user && {
        user: new ObjectId(user._id),
      }),
      ...(!user && {
        session_id,
      }),
      'items.product': new ObjectId(product_id),
    });
    if (!cart || !cart.items.length) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    const productCount = cart.items.find((item) => item.product.toString() === product_id)?.count || 0;
    if (productCount > 1) {
      await this.cartModel.updateOne(
        { _id: cart._id, 'items.product': new ObjectId(product_id) },
        {
          $inc: {
            'items.$.count': -1,
          },
        },
      );
    } else {
      await this.cartModel.updateOne(
        { _id: cart._id },
        {
          $pull: { items: { product: new ObjectId(product_id) } },
        },
      );
    }

    // if(!cart || !)

    const order = await this.orderModel.findOne({
      status: {
        $in: [statusOrder.WAITING_COMPLETION_INFORMATION, statusOrder.WAITING_PAYMENT],
      },
    });
    if (order) {
      const cart_item: any = this.getCarts(user, session_id);
      const payDetails = {
        ...cart_item.payDetails,
        price_post: order.pay_details.price_post,
      };
      return this.orderModel.updateOne(
        { _id: order._id },
        {
          baskets: cart_item.items,
          ashantions: cart_item.ashantions,
          pay_details: payDetails,
        },
      );
    }
  }

  async deleteAllCarts(user: UserDocument, session_id: string) {
    await this.cartModel.deleteMany({
      ...(user !== undefined && {
        user: new ObjectId(user._id),
      }),
      ...(user == undefined && {
        session_id,
      }),
    });
  }
  async getCarts(user: UserAuth, session_id?: string): Promise<any> {
    const setting = await this.settingService.getSettingByAdmin();
    const discountPlan = setting?.discountPlan || 0;
    let tax = 0;
    if (setting.tax_percent) {
      tax = setting.tax_percent;
    }
    const matchFilters = {
      ...(user && {
        user: user._id,
      }),
      ...(!user && {
        session_id,
      }),
    };

    const cartItems = await this.cartModel.aggregate([
      {
        $match: {
          ...matchFilters,
        },
      },
      {
        $lookup: {
          from: 'products',
          let: { productIds: '$items.product' },

          pipeline: [
            {
              $addFields: {
                tax: {
                  $multiply: ['$selling_price', tax / 100],
                },
              },
            },
            {
              $addFields: {
                final_price: {
                  $sum: ['$tax', '$price_after_discount'],
                },
              },
            },
            {
              $addFields: {
                final_price: {
                  $round: ['$final_price', 0],
                },
                tax: {
                  $round: ['$tax', 0],
                },
              },
            },
            {
              $match: {
                $expr: { $in: ['$_id', '$$productIds'] },
              },
            },
          ],
          as: 'productObjects',
        },
      },
      {
        $addFields: {
          items: {
            $map: {
              input: '$items',
              as: 'item',
              in: {
                $mergeObjects: [
                  '$$item',
                  {
                    product: {
                      $arrayElemAt: [
                        '$productObjects',
                        {
                          $indexOfArray: ['$productObjects._id', '$$item.product'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      // {
      //   $project: {
      //     user: 1,
      //     session_id: 1,
      //     'items.product': 1,
      //     'items.count':"$items.count"
      //   },
      // },
    ]);
    const items = (cartItems.length && cartItems[0]?.items) || [];
    const result = items.reduce(
      (accumulator, item) => {
        const score_product = Number(item.product.price_after_discount) * Number(item.product.score);
        const price_discount_plan = (score_product * discountPlan) / 100;
        const price_discount_plan_final = item.product.price_after_discount - price_discount_plan;

        const totalPrice = item.product.selling_price * item.count;
        const totalPriceWithDiscountPlan = price_discount_plan_final * item.count;
        const totalPriceWithScoreOrder = score_product * item.count;
        const totalScoreOrder = item.product.score * item.count;
        const totalTax = item.product.tax * item.count;

        return {
          totalPrice: accumulator.totalPrice + totalPrice,
          totalPriceWithDiscountPlan: accumulator.totalPriceWithDiscountPlan + totalPriceWithDiscountPlan,
          totalPriceWithScoreOrder: accumulator.totalPriceWithScoreOrder + totalPriceWithScoreOrder,
          totalScoreOrder: accumulator.totalScoreOrder + totalScoreOrder,
          totalTax: accumulator.totalTax + totalTax,
        };
      },
      {
        totalPrice: 0,
        totalPriceWithDiscountPlan: 0,
        totalPriceWithScoreOrder: 0,
        totalScoreOrder: 0,
        totalTax: 0,
      },
    );
    // const tax = Math.ceil(((Number(tottal_price_dicount_plan) * 9) / 100))
    const price_post = 0;
    let orders = [];
    if (user) {
      orders = await this.orderModel.find({
        user: user._id,
        status: {
          $in: [statusOrder.WAITING_COMPLETION_INFORMATION, statusOrder.WAITING_PAYMENT],
        },
      });
    }
    const ashantions = [];
    for (const item of items) {
      const ashantion = await this.ashantionModel
        .findOne({
          product: new ObjectId(item.product._id),
          product_count: {
            $lte: item.count,
          },
        })
        .populate('product_ashantion');
      if (ashantion) {
        const count = Math.floor(item.count / ashantion.product_count) * ashantion.ashantion_count;
        ///@ts-ignore
        if (ashantion.product_ashantion.inventory > 0 && ashantion.product_ashantion.inventory >= item.count) {
          ashantions.push({
            ///@ts-ignore
            product: ashantion.product_ashantion,
            count,
          });
        }
      }
    }
    return {
      items,
      payDetails: {
        tottal_price_dicount_plan: Math.round(result.totalPriceWithDiscountPlan),
        tottal_price: Math.round(result.totalPrice),
        tottal_price_score_order: Math.round(result.totalPriceWithScoreOrder),
        tottal_score_order: Math.round(result.totalScoreOrder),
        product_amount: Math.round(result.totalPriceWithDiscountPlan),
        tottal_tax: Math.round(result.totalTax),
        price_post: 0,
        copun_price: 0,
        payment_amount:
          Math.round(result.totalPriceWithDiscountPlan) + Math.round(result.totalTax) + Math.round(price_post),
      },
      ashantions,
    };
  }
}
