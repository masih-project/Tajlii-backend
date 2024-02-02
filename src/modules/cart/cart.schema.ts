import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type cartDocument = HydratedDocument<Cart>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class CartItem {
  @Prop({ type: Number, default: 1 })
  count: number;

  @Prop({ default: null, type: Types.ObjectId, ref: 'products' })
  product: Types.ObjectId;
}

export const cartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Cart {
  @Prop({ default: '', type: Types.ObjectId, ref: 'users' })
  user: Types.ObjectId;

  @Prop({ default: '', type: String })
  session_id: string;

  @Prop({ type: [cartItemSchema] })
  items: CartItem[];
}
export const cartSchema = SchemaFactory.createForClass(Cart);
