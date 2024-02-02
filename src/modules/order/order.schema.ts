import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DeliveryMethod } from 'src/types/public.types';
import { Product } from '../product/schemas/product.schema';
import { statusShipping } from '@$/types/status.types';

export type OrderDocument = HydratedDocument<Order>;
export class PayDetails {
  @Prop({ type: Number, default: 0 })
  tottal_price_dicount_plan: number;
  @Prop({ type: Number, default: 0 })
  tottal_price: number;
  @Prop({ type: Number, default: 0 })
  tottal_price_score_order: number;
  @Prop({ type: Number, default: 0 })
  tottal_score_order: number;
  @Prop({ type: Number, default: 0 })
  product_amount: number;
  @Prop({ type: Number, default: 0 })
  tottal_tax: number;
  @Prop({ type: Number, default: 0 })
  price_post: number;
  @Prop({ type: Number, default: 0 })
  payment_amount: number;
  @Prop({ type: Number, default: 0 })
  copun_price: number;
}
@Schema({
  timestamps: true,
  versionKey: false,
})
export class Order {
  @Prop({ default: null, type: Object })
  address: object;

  @Prop({ default: null, type: Types.ObjectId, ref: 'periods' })
  period: Types.ObjectId;

  @Prop({ default: '', type: Types.ObjectId, ref: 'users' })
  user: Types.ObjectId;

  @Prop({ type: String, unique: true })
  code_order: string;
  @Prop({ type: PayDetails })
  pay_details: PayDetails;
  @Prop()
  baskets: [
    {
      product: {
        [x: string]: any;
        type: Product;
      };
      count: {
        type: number;
        default: 1;
      };
    },
  ];

  @Prop()
  ashantions: [
    {
      product: {
        [x: string]: any;
        type: Product;
      };
      count: {
        type: number;
        default: 1;
      };
    },
  ];

  @Prop({ type: Number, default: 0 })
  status: number;

  @Prop({ type: Number, default: 0 })
  status_transaction: number;

  @Prop({ type: Types.ObjectId, ref: 'copuns', default: null })
  copun: Types.ObjectId;

  @Prop({ type: Number, default: DeliveryMethod.POST })
  delivery_method: DeliveryMethod.POST;

  @Prop({ type: Number, default: statusShipping.WAITING_CONFIRMED })
  statusShipping: number;

  @Prop({ type: String, default: '' })
  shipment_tracking_code: string;

  @Prop({ type: Number, default: 0 })
  shipment_number: number;

  @Prop({ type: Number, default: 0 })
  count_product: number;

  @Prop({ type: Number, default: 0 })
  payment_way: number;

  @Prop({ type: Boolean, default: false })
  has_network_calculation: boolean;

  @Prop({ type: Types.ObjectId, default: null })
  depot: Types.ObjectId;
}
export const orderSchema = SchemaFactory.createForClass(Order);
