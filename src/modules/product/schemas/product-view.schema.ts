import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class ProductView {
  @Prop({ type: ObjectId, ref: 'products' })
  product: ObjectId;

  @Prop({ type: ObjectId, ref: 'users' })
  user?: ObjectId;

  @Prop({})
  sessionId?: string;
}
export const productViewSchema = SchemaFactory.createForClass(ProductView);
export type ProductViewDocument = HydratedDocument<ProductView>;
