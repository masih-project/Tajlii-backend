import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ObjectId } from 'mongodb';

export const TerminateRequestReason = [
  'عدم حمایت تیم آموزشی',
  'عدم رضایت از محصولات',
  'عدم کسب درآمد و عدم رضایت از طرح درآمدی',
  'مشکلات شخصی',
  'علاقه نداشتن به کسب و کار بازاریابی شبکه ای',
  'پیدا کردن یک کسب و کار جدید',
  'منصرف شدن از ادامه انجام کار توسط اطرافیان ',
  'شنیدن وعده های دروغ از تیم حامی',
  'پیدا کردن یک شرکت بازاریابی شبکه ای جدید',
  'وجود مشکل با سایر بازاریابان و اعضای تیم حامی',
] as const;

export const TerminateRequestStatus = ['New', 'Requested', 'Confirmed', 'Rejected'] as const;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class TerminateRequest {
  @Prop({ type: String, enum: TerminateRequestReason })
  reason: (typeof TerminateRequestReason)[number];

  @Prop({ nullable: true })
  description?: string;

  @Prop({ type: String, nullable: true })
  status?: (typeof TerminateRequestStatus)[number];

  @Prop({ nullable: true })
  assessDescription?: string;

  @Prop({ select: false })
  code: string;

  @Prop({ type: Types.ObjectId, ref: 'users' })
  user: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
export const TerminateRequestSchema = SchemaFactory.createForClass(TerminateRequest);
export type TerminateRequestDocument = HydratedDocument<TerminateRequest>;
// TerminateRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 130, partialFilterExpression: { status: 'New' } });
