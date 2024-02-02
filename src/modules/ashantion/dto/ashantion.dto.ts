import { ProductResponse } from './../../product/dto/product.dto';
import { DepotResponse } from 'src/modules/Depot/dto/depot.dto';
export class AshantionResponse {
  _id: string;
  product: ProductResponse;
  product_count: number;
  ashantion_count: number;
  product_ashantion: ProductResponse;
  max_count_ashantion: number;
  depot: DepotResponse;
  count_used: number;
}
