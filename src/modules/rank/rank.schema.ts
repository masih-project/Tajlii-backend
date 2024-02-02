import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type rankDocument = HydratedDocument<Rank>;
@Schema({
  timestamps: true,
  versionKey: false,
})
export class Rank {
  @Prop({ default: '', type: String })
  name: string;
  @Prop({ default: '', type: String })
  team_goal: string;
  @Prop({ default: 0, type: Number })
  min_personal_selling: number;

  @Prop({ default: 0, type: Number })
  max_personal_selling: number;

  @Prop({ default: 0, type: Number })
  team_selling: number;

  @Prop({ default: 0, type: Number })
  count_axis: number;

  @Prop({ default: 0, type: Number })
  number_rank: number;
}
export const rankSchema = SchemaFactory.createForClass(Rank);
