import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PermissionType } from '../types';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Role {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, type: [String] })
  permissions: PermissionType[];

  // @Prop({
  //   type: Types.ObjectId,
  //   ref: Admin.name,
  // })
  // updatedBy: Admin;
}
export const RoleSchema = SchemaFactory.createForClass(Role);
export type RoleDocument = HydratedDocument<Role>;
