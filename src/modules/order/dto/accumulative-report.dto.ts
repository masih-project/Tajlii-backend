import { getEnumKeys, statusOrder, statusShipping } from '@$/types/status.types';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { DeliveryMethod, OrderType } from 'src/types/public.types';

export const AccumulativeSortItems = <const>[
  'product_code',
  'title_en',
  'title_fa',
  'productCount',
  'orderCount',
  'selling_price',
];
export type AccumulativeSortType = (typeof AccumulativeSortItems)[number];
export class AccumulativeReportDto {
  @IsOptional()
  @IsEnum(DeliveryMethod)
  delivery_method?: DeliveryMethod;

  @ApiProperty({ enum: getEnumKeys(statusOrder), isArray: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value.map((x) => statusOrder[x]) : [statusOrder[value]]))
  @IsArray()
  @IsIn([0, 1, 2, 3, 4, 5, 6], { each: true })
  status?: number[];

  @ApiProperty({ enum: getEnumKeys(statusShipping), isArray: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value.map((x) => statusShipping[x]) : [statusShipping[value]]))
  @IsArray()
  @IsIn([0, 1, 2, 3, 4, 5, 6], { each: true })
  statusShipping?: number[];

  @IsOptional()
  @IsInt()
  status_transaction?: number;

  @IsOptional()
  @IsDate()
  dateFrom?: Date;

  @IsOptional()
  @IsDate()
  dateTo?: Date;

  @ApiProperty({ default: 10 })
  @IsOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  limit?: number;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @ApiProperty({ default: OrderType.ASC })
  @IsOptional()
  @IsEnum(OrderType)
  sortOrder?: OrderType;

  @ApiProperty({ type: 'string', default: 'title_fa', enum: AccumulativeSortItems })
  @IsOptional()
  @IsIn(AccumulativeSortItems)
  sortBy?: AccumulativeSortType;
}
export class DownloadAccumulativeReportDto extends OmitType(AccumulativeReportDto, ['skip', 'limit']) {}

export class AccumulativeReportResponse {
  product_id: string;
  title_en: string;
  title_fa: string;
  slug: string;
  images: string[];
  orderCount: number;
  productCount: number;
  count_sales: number;
  selling_price: number;
  final_price: number;
  discount: number;
  base_price: number;
  price_after_discount: number;
  product_code: string;
  ashantionsCount: number;
  totalCount: number;
}
