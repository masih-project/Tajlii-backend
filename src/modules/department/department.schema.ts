import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type departmentDocument = HydratedDocument<Department> & Document;
@Schema({
  id: false,
  versionKey: false,
  timestamps: true,
})
export class Department {
  @Prop({ default: '', type: String })
  name: string;
  @Prop({ default: '', type: String })
  slug: string;
}
export const departmentSchema = SchemaFactory.createForClass(Department);
