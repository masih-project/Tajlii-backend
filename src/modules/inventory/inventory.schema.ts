import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type InventoryDocument = HydratedDocument<Inventory>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class History {
  @Prop({ type: Types.ObjectId }) // Add _id property with type ObjectId
  _id: Types.ObjectId;
  @Prop({ type: Number, default: 0 })
  count: number;
}

export const historySchema = SchemaFactory.createForClass(History);

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Inventory {
  @Prop({ default: null, type: Types.ObjectId, ref: 'depots' })
  depot: Types.ObjectId;

  @Prop({ default: null, type: Types.ObjectId, ref: 'products' })
  product: Types.ObjectId;

  @Prop({ default: 0, type: Number })
  countUsed: number;

  @Prop({ default: 0, type: Number })
  countProduct: number;

  @Prop({ type: [historySchema] })
  histories: History[];
}
export const InventorySchema = SchemaFactory.createForClass(Inventory);
