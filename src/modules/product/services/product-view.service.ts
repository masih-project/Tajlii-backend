import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProductView } from '../schemas/product-view.schema';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class ProductViewService {
  constructor(@InjectModel(ProductView.name) private model: Model<ProductView>) {}

  async addViewAndGetViewCount(productId: ObjectId, sessionId?: string, userId?: string | ObjectId) {
    await this.addView(productId, sessionId, userId);
    return this.getViewCount(productId);
  }

  async addView(productId: ObjectId, sessionId?: string, userId?: string | ObjectId) {
    const user = userId ? new ObjectId(userId) : undefined;
    const view = await this.model.findOne({
      $or: [{ product: productId, sessionId }, ...(user ? [{ product: productId, user }] : [])],
    });
    if (view && user && !view.user)
      await this.model.updateOne(
        { product: productId },
        {
          $set: {
            user,
          },
        },
      );
    if (!view)
      await this.model.create({
        product: productId,
        user,
        sessionId,
      });
  }

  async getViewCount(productId: ObjectId) {
    return this.model.count({ product: productId });
  }
}
