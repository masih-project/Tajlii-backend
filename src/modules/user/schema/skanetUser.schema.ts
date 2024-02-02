import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import mongoose, { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { RoleUser } from 'src/types/role.types';
export type skanetUsersDocument = HydratedDocument<SkanetUser> & Document;
@Schema({
  versionKey: false,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class SkanetUser {
  @Prop({ default: '', type: String })
  first_name: string;
  @Prop({ default: '', type: String })
  last_name: string;
  @Prop({ default: '', type: String })
  gender: string;
  @Prop({ type: String, required: true, unique: true })
  national_code: string;
  @Prop({ type: String, default: '' })
  address: string;
  @Prop({ type: String, required: false })
  phone_number: string;
  @Prop({ type: String, required: true, unique: true })
  mobile: string;
  @Prop({ type: String, ref: 'users' })
  identification_code: string;
  @Prop({ type: String, default: '' })
  marketer_code: string;
  @Prop({ type: String, required: true, unique: true })
  username: string;
  @Prop({ type: String, default: '' })
  postal_code: string;
  @Prop({ type: String, default: '' })
  password: string;
  @Prop({ type: Boolean, default: true })
  is_iranian: boolean;
  @Prop({ type: String, default: '' })
  brith_day: string;
  @Prop({ type: String, default: '' })
  city_id: string;

  @Prop({ type: String, default: '' })
  province_id: string;

  @Prop({ type: String, default: '' })
  father_name: string;
  @Prop({ type: String, default: '' })
  birth_certificate_code: string;
  @Prop({ type: String, ref: 'users', default: '' })
  code_upper_head: string;
  @Prop({ type: String, default: '', unique: true })
  email: string;
  @Prop({ type: Number, default: 0 })
  status: 0 | 1 | 2;
  @Prop({ type: String, default: '' })
  img_url: string;
  @Prop({ type: String, default: '' })
  date_expired: string;
  @Prop({ type: [String] })
  role: RoleUser[];
}
export const skanetUserSchema = SchemaFactory.createForClass(SkanetUser);
