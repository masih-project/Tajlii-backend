import { BrandResponse } from 'src/modules/brand/dto/brand.dto';

export class ProductResponse {
  _id: string;
  title_fa: string;
  title_en: string;
  description: string;
  brand: BrandResponse;
  category: any;
  score: number;
  tags: string[];
  discount: number;
  selling_price: number;
  product_code: string;
  base_price: number;
  product_id: string;
  images: string[];
  release_date: Date;
  inventory: number;
  slug: string;
  weight: number;
  height: number;
  width: number;
  price_after_discount: number;
}
