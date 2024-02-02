import { Depot } from '../Depot/depot.interface';
import { Product } from '../product/schemas/product.schema';

export interface Ashantion {
  _id: string;
  product: string | Product;
  product_count: number;
  product_ashantion: string | Product;
  ashantion_count: number;
  max_count_ashantion: number;
  depot: string | Depot;
  count_used: number;
}
