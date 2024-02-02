import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type BrandDocument = HydratedDocument<Brand>;
@Schema({
  timestamps: true,
  versionKey: false,
})
export class Brand {
  @Prop({ default: '', type: String })
  name: string;
  @Prop({ default: '', type: String })
  slug: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'categories' }],
    default: [],
  })
  categories: Types.ObjectId[];
}
export const brandSchema = SchemaFactory.createForClass(Brand);
brandSchema.index({ name: 'text', slug: 'text' });
