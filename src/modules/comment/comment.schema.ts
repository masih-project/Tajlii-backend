import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment> & any;
@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
  id: false,
})
export class Comment {
  @Prop({ type: String, required: true })
  comment: string;

  @Prop({ type: Types.ObjectId, ref: 'users', default: null })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'admins', default: null })
  admin: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'products' })
  product: Types.ObjectId;

  @Prop({ default: undefined, type: Types.ObjectId, ref: 'comments' })
  parent: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  status: 0 | 1 | 2;
}
export const commentSchema = SchemaFactory.createForClass(Comment);

commentSchema.index({ comment: 'text' });
commentSchema.virtual('answers', {
  ref: 'comments',
  localField: '_id',
  foreignField: 'parent',
});
