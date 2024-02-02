import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { ProductRating } from '../schemas/product-rating.schema';

export interface IRating {
  average?: number;
  total?: number;
  userRate?: number;
}
@Injectable()
export class ProductRatingService {
  constructor(@InjectModel(ProductRating.name) private model: Model<ProductRating>) {}

  async rateProduct(productId: ObjectId, userId: string | ObjectId, score: number) {
    const user = userId ? new ObjectId(userId) : undefined;
    const rating = await this.model.findOne({ product: productId, user });
    if (!rating)
      return this.model.create({
        product: productId,
        user,
        score,
      });
    rating.score = score;
    return rating.save();
  }

  async getRates(productId: ObjectId, userId?: string | ObjectId): Promise<IRating> {
    const user = userId ? new ObjectId(userId) : undefined;
    const rating = await this.model.aggregate([
      {
        $match: { product: productId },
      },
      {
        $group: {
          _id: null,
          count: { $count: {} },
          score: { $avg: '$score' },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          score: { $round: ['$score', 2] },
        },
      },
    ]);
    if (!rating.length)
      return {
        average: null,
        total: 0,
      };
    const userRate = user ? await this.model.findOne({ product: productId, user }) : undefined;
    return {
      average: rating[0].score,
      total: rating[0].count,
      userRate: userRate?.score,
    };
  }
}
