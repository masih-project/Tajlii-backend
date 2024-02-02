import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class BlogView {
  @Prop({ type: ObjectId, ref: 'products' })
  product: ObjectId;

  @Prop({ type: ObjectId, ref: 'users' })
  user?: ObjectId;

  @Prop({})
  sessionId?: string;
}
export const blogViewSchema = SchemaFactory.createForClass(BlogView);
export type BlogViewDocument = HydratedDocument<BlogView>;
