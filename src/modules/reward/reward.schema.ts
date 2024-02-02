import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type rewardDocument = HydratedDocument<Reward>;
@Schema({
  timestamps: true,
  versionKey: false,
})
export class Reward {
  @Prop({ default: '', type: Types.ObjectId, ref: 'users' })
  user: Types.ObjectId;

  @Prop({ default: '', type: Types.ObjectId, ref: 'orders' })
  order: Types.ObjectId;

  @Prop({ default: '', type: Types.ObjectId, ref: 'users' })
  order_user: Types.ObjectId;

  @Prop({ default: 0, type: Number })
  price_reward: number;

  @Prop({ type: Types.ObjectId, default: '', ref: 'periods' })
  period: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  type: number;
}
export const rewardSchema = SchemaFactory.createForClass(Reward);
