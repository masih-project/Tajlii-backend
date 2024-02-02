import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument } from 'mongoose';

export class CampaignBeneficiary {
  marketer: ObjectId | string;
  marketerNationalCode: string;
  order: number;
  saleCeiling: number;
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Campaign {
  @Prop({ required: true })
  title: string;

  @Prop({})
  description?: string;

  @Prop({ required: true, type: ObjectId, ref: 'users' })
  manager: ObjectId;

  @Prop({ type: raw({}) })
  beneficiaries?: CampaignBeneficiary[];

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({})
  startDate?: Date;
  @Prop({})
  endDate?: Date;

  @Prop({ type: ObjectId, ref: 'admins' })
  admin?: ObjectId;
}
export const CampaignSchema = SchemaFactory.createForClass(Campaign);
export type CampaignDocument = HydratedDocument<Campaign>;
