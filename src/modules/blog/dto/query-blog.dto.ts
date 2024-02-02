import { OrderType } from '@$/types/public.types';
import { statusBlog } from '@$/types/status.types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export const BlogSortItemsByAdmin = <const>[
  'content',
  'title',
  'status',
  'readingTime',
  'slug',
  'summary',
  'releaseDate',
  'createdAt',
];
export type BlogSortTypeByAdmin = (typeof BlogSortItemsByAdmin)[number];

export const BlogSortItems = <const>['content', 'title', 'readingTime', 'slug', 'summary', 'createdAt'];
export type BlogSortType = (typeof BlogSortItems)[number];

export class QueryBlog {
  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  categories: string[];

  @ApiProperty({ default: OrderType.ASC })
  @IsOptional()
  @IsEnum(OrderType)
  order_type?: OrderType;

  @ApiProperty({ required: true, enum: BlogSortItems })
  @IsOptional()
  @IsEnum(BlogSortItems, { each: true })
  order_by: BlogSortType;
}

export class QueryBlogByAdmin {
  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  categories: string[];

  @ApiProperty({ required: false, enum: statusBlog })
  @IsOptional()
  @IsEnum(statusBlog)
  status: statusBlog;

  @ApiProperty({ default: OrderType.ASC })
  @IsOptional()
  @IsEnum(OrderType)
  order_type?: OrderType;

  @ApiProperty({ required: true, enum: BlogSortItemsByAdmin })
  @IsOptional()
  @IsEnum(BlogSortItemsByAdmin, { each: true })
  order_by: BlogSortTypeByAdmin;
}
