import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ashantionDocument = HydratedDocument<Comment> & any;
@Schema({
  timestamps: true,
  versionKey: false,
  id: false,
})
export class Ashantion {
  @Prop({ type: Types.ObjectId, default: '', ref: 'products' })
  product: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  product_count: number;

  @Prop({ type: Number, default: 0 })
  ashantion_count: number;

  @Prop({ type: Types.ObjectId, default: '', ref: 'products' })
  product_ashantion: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  max_count_ashantion: number;

  @Prop({ type: Types.ObjectId, default: '', ref: 'depots' })
  depot: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  count_used: number;
}
export const ashantionSchema = SchemaFactory.createForClass(Ashantion);
