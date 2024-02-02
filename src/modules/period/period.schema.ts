import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type periodDocument = HydratedDocument<Period>;
@Schema({
  timestamps: true,
  versionKey: false,
})
export class Period {
  @Prop({ default: '', type: Date })
  start_date: Date;

  @Prop({ default: '', type: Date })
  end_date: Date;

  @Prop({ default: 0, type: Number })
  status: 0 | 1 | 2;
}
export const periodSchema = SchemaFactory.createForClass(Period);
