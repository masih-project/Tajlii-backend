import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type settingDocument = HydratedDocument<Setting>;
export class MultiLevelRewardPercentage {
  @Prop({ type: Number, default: 0 })
  level1: number;
  @Prop({ type: Number, default: 0 })
  level2: number;
  @Prop({ type: Number, default: 0 })
  level3: number;
  @Prop({ type: Number, default: 0 })
  level4: number;
  @Prop({ type: Number, default: 0 })
  level5: number;
}

export class GenerationRewardPercentage {
  @Prop({ type: Number, default: 0 })
  level1: number;
  @Prop({ type: Number, default: 0 })
  level2: number;
  @Prop({ type: Number, default: 0 })
  level3: number;
  @Prop({ type: Number, default: 0 })
  level4: number;
}
@Schema({
  timestamps: true,
  versionKey: false,
})
export class Setting {
  @Prop({ default: 0, type: Number })
  price_post: number;

  @Prop({ default: 0, type: Number })
  tax_percent: number;

  @Prop({ default: 0, type: Number })
  dollar_price: number;

  @Prop({ default: 0, type: Number })
  postal_code: number;

  @Prop({ default: '', type: String })
  phone_number: string;

  @Prop({ default: 0, type: Number })
  identificationRewardPercentage: number;

  @Prop({ type: MultiLevelRewardPercentage, default: null })
  multiLevelRewardPercentage: MultiLevelRewardPercentage;

  @Prop({ type: GenerationRewardPercentage, default: null })
  generationRewardPercentage: GenerationRewardPercentage;

  @Prop({ type: Number, default: 0 })
  priceFreeShipHub: number;

  @Prop({ type: Number, default: 0 })
  discountPlan: number;
}
export const settingSchema = SchemaFactory.createForClass(Setting);
