import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class ProductRating {
  @Prop({ type: ObjectId, ref: 'products' })
  product: ObjectId;

  @Prop({ type: ObjectId, ref: 'users' })
  user: ObjectId;

  @Prop({})
  score: number;
}
export const productRatingSchema = SchemaFactory.createForClass(ProductRating);
export type ProductRatingDocument = HydratedDocument<ProductRating>;
