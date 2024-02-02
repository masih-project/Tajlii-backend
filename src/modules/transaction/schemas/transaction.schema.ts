import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type transactionDocument = HydratedDocument<Transaction> & any;
@Schema({
  timestamps: true,
  versionKey: false,
})
export class Transaction {
  @Prop({ default: '', type: Types.ObjectId, ref: 'users' })
  user: Types.ObjectId;
  @Prop({ default: '', type: Types.ObjectId, ref: 'orders' })
  order: Types.ObjectId;
  @Prop({ default: '', type: String })
  authority: string;
  @Prop({ default: '', type: String })
  transactionـcode: string;
  @Prop({ default: '', type: String })
  ref_id: string;
  @Prop({ default: '', type: String })
  card_hash: string;
  @Prop({ default: '', type: String })
  card_pan: string;
  @Prop({ default: 0, type: Number })
  amount: number;
  @Prop({ default: 0, type: Number })
  status: number;
  @Prop()
  baskets: [
    {
      product: {
        type: Types.ObjectId;
        ref: 'products';
      };
    },
  ];

  @Prop({ type: Number, default: 0 })
  payment_way: number;
}
export const transactionSchema = SchemaFactory.createForClass(Transaction);
