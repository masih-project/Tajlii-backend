import { Product } from '@$/modules/product/schemas/product.schema';
import { Cart } from 'src/modules/cart/interface/cart.interface';
import { User } from 'src/modules/user/user.interface';
import { DeliveryMethod, PaymentWay } from 'src/types/public.types';

export class PayDetails {
  tottal_price_dicount_plan: number;
  tottal_price: number;
  tottal_price_score_order: number;
  tottal_score_order: number;
  product_amount: number;
  tottal_tax: number;
  price_post: number;
  payment_amount: number;
  copun_price: number;
}

export class Ashantion {
  product: Product;
  count: number;
}
export interface Order {
  address: string;
  user: User;
  code_order: string;
  pay_details: PayDetails;
  baskets: Cart[];
  status: number;
  copun: string;
  delivery_method: DeliveryMethod.POST | DeliveryMethod.INPERSON;
  count_product: number;
  shipment_number: number;
  shipment_tracking_code: string;
  ashantions: Ashantion[];
  status_transaction: number;
  payment_way: PaymentWay.ZARINPAL;
  has_network_calculation: boolean;
}
