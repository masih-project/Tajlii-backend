import { ProductResponse } from 'src/modules/product/dto/product.dto';
import { statusComment } from 'src/types/status.types';

export class CommentResponse {
  _id: string;
  comment: string;
  product: ProductResponse;
  user: any;
  status: statusComment.CANCELED | statusComment.CONFIRMED | statusComment.PENDING = statusComment.CANCELED;
}
