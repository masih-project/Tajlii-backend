import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type categoryBlogDocument = HydratedDocument<CategoryBlog> & Document;
@Schema({
  id: false,
  versionKey: false,
  timestamps: true,
})
export class CategoryBlog {
  @Prop({ default: '', type: String })
  name: string;
  @Prop({ default: '', type: String })
  slug: string;
}
export const categoryBlogSchema = SchemaFactory.createForClass(CategoryBlog);
