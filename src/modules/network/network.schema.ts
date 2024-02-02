import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type networkDocument = HydratedDocument<Network>;
@Schema({
  timestamps: true,
  versionKey: false,
})

export class Network {
  @Prop({ type: Types.ObjectId, default: '', ref: 'users' })
  user: Types.ObjectId;

  @Prop({ default: 0, type: Number })
  personal_selling: number;

  @Prop({ default: 0, type: Number })
  tottal_score_order: number;

  @Prop({ default: 0, type: Number })
  tottal_team_score_order: number;

  @Prop({ default: 0, type: Number })
  team_selling: number;

  @Prop({ type: Types.ObjectId, default: '', ref: 'periods' })
  period: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null, ref: 'ranks' })
  rank: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: '', ref: 'orders' })
  order: Types.ObjectId;
}
export const networkSchema = SchemaFactory.createForClass(Network);
