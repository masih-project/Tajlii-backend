import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type DepotDocument = HydratedDocument<Depot>;
@Schema({
  timestamps: true,
  versionKey: false,
})
export class Depot {
  @Prop({ default: '', type: String })
  title: string;
  @Prop({ default: '', type: String })
  phone: string;
  @Prop({ default: '', type: String })
  address: string;
  @Prop({ default: 0, type: Number })
  status: 0 | 1;
}
export const DepotSchema = SchemaFactory.createForClass(Depot);
