import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type InventoryHistoriesDocument = HydratedDocument<InventoryHistories>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class InventoryHistories {
  @Prop({ default: null, type: Types.ObjectId, ref: 'depots' })
  depot: Types.ObjectId;

  @Prop({ default: null, type: Types.ObjectId, ref: 'products' })
  product: Types.ObjectId;

  @Prop({ default: 0, type: Number })
  inventoryBoost: number;

  @Prop({ default: 0, type: Number })
  inventoryDecline: number;

  @Prop({ default: 0, type: Number })
  finalInventory: number;

  @Prop({ type: Types.ObjectId, default: null })
  order: Types.ObjectId;

  @Prop({ type: String, default: '' })
  history: string;
}
export const InventoryHistoriesSchema = SchemaFactory.createForClass(InventoryHistories);
