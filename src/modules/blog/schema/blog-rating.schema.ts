import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class BlogRating {
  @Prop({ type: ObjectId, ref: 'blogs' })
  blog: ObjectId;

  @Prop({ type: ObjectId, ref: 'users' })
  user: ObjectId;

  @Prop({})
  score: number;
}
export const blogRatingSchema = SchemaFactory.createForClass(BlogRating);
export type BlogRatingDocument = HydratedDocument<BlogRating>;
