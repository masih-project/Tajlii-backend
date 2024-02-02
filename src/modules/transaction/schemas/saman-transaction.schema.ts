import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument } from 'mongoose';

export enum TransactionStatus {
  NEW = 'NEW',
  SUCCESS = 'SUCCESS',
  VERIFIED = 'VERIFIED',
  CONFLICT = 'CONFLICT',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class SamanTransaction {
  @Prop({ required: true, type: ObjectId, ref: 'users' })
  user: ObjectId;

  @Prop({})
  ip: string;

  @Prop({ required: true, type: ObjectId, ref: 'orders' })
  order: ObjectId;

  @Prop({ required: true, enum: TransactionStatus })
  status: TransactionStatus;

  @Prop({ required: true })
  amount: number;

  @Prop({ unique: true, sparse: true, required: false })
  refNum?: string;

  @Prop({ required: false })
  campaignId?: string;

  @Prop({ type: raw({}) })
  tokenResult?: any;
  @Prop({ type: raw({}) })
  paymentResult?: any;
  @Prop({ type: raw({}) })
  verifyResult?: any;
  @Prop({ type: raw({}) })
  reversalResult?: any;
}

export const SamanTransactionSchema = SchemaFactory.createForClass(SamanTransaction);
export type SamanTransactionDocument = HydratedDocument<SamanTransaction>;
