import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ComplaintType } from '../types';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Complaint {
  @Prop({ required: true, type: String, enum: Object.keys(ComplaintType) })
  type: keyof typeof ComplaintType;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: false })
  isAnswered: boolean;
}
export const ComplaintSchema = SchemaFactory.createForClass(Complaint);
export type ComplaintDocument = HydratedDocument<Complaint, { createdAt: Date }>;
