import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../../role/schemas/role.schema';

export type AdminDocument = HydratedDocument<Admin>;

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.password;
      return ret;
    },
  },
})
export class Admin {
  @Prop({ default: '', type: String })
  first_name: string;
  @Prop({ default: '', type: String })
  last_name: string;
  @Prop({ default: '', type: String })
  email: string;

  @Prop({ default: '', type: String, select: true })
  password: string;

  @Prop({ type: String, required: true })
  username: string;
  @Prop({ type: String, required: true })
  phone_number: string;
  @Prop({ type: String, default: '' })
  img_url: string;
  @Prop({ type: Number, default: 0 })
  status: 0 | 1;

  @Prop({ type: Types.ObjectId, ref: Role.name })
  roleId: Role;

  @Prop({ type: Types.ObjectId, ref: 'departments', default: [] })
  departments: Types.ObjectId[];
}
export const adminSchema = SchemaFactory.createForClass(Admin);
adminSchema.index({ first_name: 'text', last_name: 'text', email: 'text', username: 'text', phone_number: 'text' });
