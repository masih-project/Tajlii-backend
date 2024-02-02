import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
export type BookMarkDocument = HydratedDocument<BookMark>;
@Schema({
  timestamps: true,
  versionKey: false,
})
export class BookMark {
  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'products' })
  product: mongoose.Types.ObjectId;
  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'users' })
  user: mongoose.Types.ObjectId;
}
export const BookMarkSchema = SchemaFactory.createForClass(BookMark);
