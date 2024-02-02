import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import mongoose, { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
export type CategoryDocument = HydratedDocument<Category> & Document;
@Schema({
  id: false,
  versionKey: false,
  toJSON: {
    virtuals: true,
  },
  timestamps: true,
})
export class Category {
  @Prop({ default: '', type: String })
  name: string;
  @Prop({ default: '', type: String })
  slug: string;
  @Prop({ default: undefined, type: Types.ObjectId, ref: 'categories' })
  parent: Types.ObjectId;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'brands' }],
    default: [],
  })
  brands: Types.ObjectId[];

  @Prop({ type: String, default: "" })
  description: string

  @Prop({ type: String, default: "" })
  imgUrl: string
}
export const categorySchema = SchemaFactory.createForClass(Category);

categorySchema.index({ name: 'text', slug: 'text' });

categorySchema.virtual('subCategories', {
  ref: 'categories',
  localField: '_id',
  foreignField: 'parent',
});
categorySchema.pre('find', function (next: NextFunction) {
  this.populate([{ path: 'subCategories' }]);
  next();
});
categorySchema.pre('findOne', function (next: NextFunction) {
  this.populate([{ path: 'subCategories' }]);
  next();
});
