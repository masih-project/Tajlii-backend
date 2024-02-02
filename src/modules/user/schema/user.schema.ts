import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { HydratedDocument } from 'mongoose';
import { RoleUser } from 'src/types/role.types';
export type UserDocument = HydratedDocument<User> & Document;

export class Document {
  @Prop({ type: String, default: '' })
  img_national_code: string;
  @Prop({ type: String, default: '' })
  img_birth_certificate_code: string;
}

export class BankInfo {
  @Prop({ type: String, default: '' })
  bank_name: string;

  @Prop({ type: String, default: '' })
  card_number: string;

  @Prop({ type: String, default: '' })
  account_number: string;

  @Prop({ type: String, default: '' })
  shaba_number: string;
}

@Schema({
  id: false,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.password;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
  },
  timestamps: true,
})
export class User {
  @Prop({ unique: true, sparse: true })
  code: string;
  @Prop({ type: String, required: true, unique: true })
  mobile: string;
  @Prop({ default: '', type: String })
  first_name: string;
  @Prop({ default: '', type: String })
  last_name: string;
  @Prop({ type: String, ref: 'users' })
  identification_code: string;

  //##
  @Prop({ type: Number, default: 0 })
  status: 0 | 1 | 2 | 3 | 4;
  @Prop({ type: [String] })
  role: RoleUser[];
  //

  @Prop({ default: '', type: String })
  gender?: string;
  @Prop({ type: String, unique: true, sparse: true })
  national_code?: string;
  @Prop({ type: String, default: '' })
  address?: string;
  @Prop({ type: String, required: false })
  phone_number?: string;

  @Prop({ type: String, default: '' })
  marketer_code?: string;
  @Prop({ type: String, unique: true, sparse: true })
  username?: string;
  @Prop({ type: String, default: '' })
  postal_code?: string;
  @Prop({ type: String, default: '' })
  password?: string;
  @Prop({ type: Boolean, default: true })
  is_iranian?: boolean;
  @Prop({ type: String, default: '' })
  brith_day?: string;
  @Prop({ type: String, default: '' })
  city_id?: string;

  @Prop({ type: String, default: '' })
  province_id?: string;
  @Prop({ type: String, default: '' })
  father_name?: string;
  @Prop({ type: String, default: '' })
  birth_certificate_code?: string;
  @Prop({ type: String, ref: 'users', default: '' })
  code_upper_head?: string;
  @Prop({ type: String, unique: true, sparse: true })
  email?: string;

  @Prop({ type: String, default: '' })
  img_url: string;
  @Prop({ type: Date })
  date_expired: Date;

  @Prop({ type: Document, default: null })
  documents: Document;

  @Prop({ type: BankInfo, default: null })
  bank_info: BankInfo;

  @Type(() => User)
  subs: UserDocument[];
}

export const userSchema = SchemaFactory.createForClass(User);
userSchema.virtual('subs', {
  ref: 'users',
  localField: 'code',
  foreignField: 'code_upper_head',
  justOne: false,
  options: { virtuals: true },
});

// userSchema.virtual('parents', {
//   ref: 'users',
//   localField: 'national_code',
//   foreignField: 'code_upper_head',
//   justOne: false,
//   options: { virtuals: true },
// });
// userSchema.pre('findOne', async function (next: NextFunction) {
//   this.populate({ path: 'subs' });
//   next();
// });

// userSchema.pre('find', async function (next: NextFunction) {
//   this.populate({ path: 'subs' });
//   next();
// });
