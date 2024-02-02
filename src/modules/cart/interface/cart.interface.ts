import { Product } from '@$/modules/product/schemas/product.schema';

export interface Cart {
  count: number;
  product: string | Product;
  user: string;
  session_id: string;
}
