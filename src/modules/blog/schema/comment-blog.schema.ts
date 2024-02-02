import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, now } from 'mongoose';
export type blogCommentDocument = HydratedDocument<BlogComment> & Document;
@Schema({
  id: false,
  versionKey: false,
  timestamps: true,
})
export class BlogComment {
    @Prop({ type: String, required: true })
    comment: string;
  
    @Prop({ type: Types.ObjectId, ref: 'users', default: null })
    user: Types.ObjectId;
  
    @Prop({ type: Types.ObjectId, ref: 'admins', default: null })
    admin: Types.ObjectId;
  
    @Prop({ type: Types.ObjectId, ref: 'blogs' })
    blog: Types.ObjectId;
  
    @Prop({ default: undefined, type: Types.ObjectId, ref: 'blogComments' })
    parent: Types.ObjectId;
  
    @Prop({ type: Number, default: 0 })
    status: 0 | 1 | 2;
}
export const blogCommentSchema = SchemaFactory.createForClass(BlogComment);

blogCommentSchema.virtual('answers', {
  ref: 'blogComments',
  localField: '_id',
  foreignField: 'parent',
});
