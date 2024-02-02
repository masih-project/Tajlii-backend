import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, now } from 'mongoose';
export type blogDocument = HydratedDocument<Blog> & Document;
@Schema({
  id: false,
  versionKey: false,
  timestamps: true,
})
export class Blog {
  @Prop({ default: '', type: String })
  title: string;
  @Prop({ default: '', type: String })
  coverImageUrl: string;

  @Prop({ default: '', type: String })
  content: string;

  @Prop({ type: Array, default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Types.ObjectId, default: null, ref: 'categoriesBlog' })
  category: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null, ref: 'admins' })
  admin: Types.ObjectId;

  @Prop({ type: Date, default: now() })
  releaseDate: Date;

  @Prop({ type: Number, default: 0 })
  status: number;

  @Prop({ type: String, default: '' })
  readingTime: string;

  @Prop({ type: String, required: true })
  slug: string;

  @Prop({ type: String, default: '' })
  summary: string;
}
export const blogSchema = SchemaFactory.createForClass(Blog);
