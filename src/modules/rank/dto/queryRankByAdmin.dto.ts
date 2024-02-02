import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { OrderType } from 'src/types/public.types';
enum SortRankByAdmin {
  name = 'name',
  team_goal = 'team_goal',
  min_personal_selling = 'min_personal_selling',
  max_personal_selling = 'min_personal_selling',
  team_selling = 'team_selling',
  number_rank = 'number_rank',
  count_axis = 'count_axis',
}
export class QueryRankByAdminDto {
  @ApiProperty({ example: 5 })
  @IsOptional()
  limit: number;
  @ApiProperty({ example: 1 })
  @IsOptional()
  skip: number;

  @ApiProperty({ example: 'ASC', required: true, enum: OrderType })
  @IsOptional()
  @IsEnum(OrderType, { each: true })
  order_type: OrderType;

  @ApiProperty({ example: 'name', required: true, enum: SortRankByAdmin })
  @IsOptional()
  @IsEnum(SortRankByAdmin, { each: true })
  order_by: SortRankByAdmin;
}
