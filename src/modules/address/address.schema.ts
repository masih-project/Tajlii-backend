import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
export type AddressDocument = HydratedDocument<Address>;
@Schema({
  timestamps: true,
  versionKey: false,
})
export class Address {
  @Prop({ required: true, type: Types.ObjectId, ref: 'provinces', default: '' })
  city_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'provinces', default: '' })
  province_id: Types.ObjectId;

  @Prop({ type: String, default: '' })
  first_name: string;

  @Prop({ type: String, default: '' })
  last_name: string;

  @Prop({ type: String, default: '' })
  mobile: string;

  @Prop({ type: String, default: '' })
  postal_code: string;

  @Prop({ type: String, default: '' })
  address: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'users' })
  user: Types.ObjectId;
}
export const AddressSchema = SchemaFactory.createForClass(Address);
