import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, HydratedDocument, now, Types } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Product {
  @Prop({ default: '', type: String })
  title_fa: string;
  @Prop({ default: '', type: String })
  title_en: string;
  @Prop({ default: '', type: String })
  description: string;
  @Prop({ type: raw({}) })
  review?: { key: string; value: string }[];
  @Prop({ type: Types.ObjectId, ref: 'brands' })
  brand: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'categories' })
  category: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'categories' })
  subCategory: Types.ObjectId;
  @Prop({ type: Number, default: 0 })
  score: number;
  @Prop({ type: Array, default: [] })
  tags: string[];
  @Prop({ type: Number, default: 0 })
  discount: number;
  @Prop({ type: Number })
  selling_price: number;
  @Prop({ type: String })
  product_code: string;
  @Prop({ type: Number })
  base_price: number;
  @Prop({ type: String })
  product_id: string;
  @Prop({ type: [String] })
  images: string[];
  @Prop({ type: Date, default: now() })
  release_date: Date;
  @Prop({ type: Number, default: 0 })
  inventory: number;
  @Prop({ type: String, default: '' })
  slug: string;
  @Prop()
  features: [
    {
      featureName: string;
      featureValue: string;
    },
  ];
  @Prop({ type: Number })
  weight: number;
  @Prop({ type: Number, default: 0 })
  height: number;
  @Prop({ type: Number, default: 0 })
  width: number;
  @Prop({ type: Types.ObjectId, ref: 'depots' })
  depot: Types.ObjectId;
  @Prop({ type: Number, default: 0 })
  price_after_discount: number;

  @Prop({ type: Number, default: 0 })
  count_sales: number;

  @Prop({ type: Number, default: 0 })
  status: number;
}
export const productSchema = SchemaFactory.createForClass(Product);
export type ProductDocument = HydratedDocument<Product>;

productSchema.index({
  title_fa: 'text',
  title_en: 'text',
  description: 'text',
  slug: 'text',
});
