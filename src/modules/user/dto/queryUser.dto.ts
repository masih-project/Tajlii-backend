import { statusUser } from '@$/types/status.types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumberString, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { Gendar, OrderType } from 'src/types/public.types';
import { RoleUser } from 'src/types/role.types';
enum SortUser {
  email = 'email',
  mobile = 'mobile',
  status = 'status',
  marketer_code = 'marketer_code',
  date_expired = 'date_expired',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}
export class QueryUser {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  skip?: number;
  @ApiProperty({
    example: 'CUSTOMER',
    required: false,
    enumName: 'Role',
    enum: RoleUser,
  })
  @IsOptional()
  @IsEnum(RoleUser, { each: true })
  role: RoleUser;

  @ApiProperty({
    isArray: true,
    required: false,
    enumName: 'Status',
    enum: statusUser,
  })
  @IsOptional()
  @IsEnum(statusUser, { each: true })
  status?: statusUser;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber('IR')
  @IsNumberString()
  mobile: string;

  @ApiProperty({ required: false })
  @IsOptional()
  phone_number: string;

  @ApiProperty({
    required: false,
    enumName: 'gender',
    enum: Gendar,
  })
  @IsOptional()
  @IsEnum(Gendar, { each: true })
  gender?: Gendar;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  code_upper_head: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  national_code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  birth_certificate_code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  identification_code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  father_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  username: string;

  @ApiProperty({ required: false })
  @IsOptional()
  marketer_code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  first_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  last_name: string;

  @IsOptional()
  @IsDate()
  dateFrom?: Date;

  @IsOptional()
  @IsDate()
  dateTo?: Date;

  @ApiProperty({ example: 'ASC', required: true, enum: OrderType })
  @IsOptional()
  @IsEnum(OrderType, { each: true })
  order_type: OrderType;

  @ApiProperty({ example: 'email', required: true, enum: SortUser })
  @IsOptional()
  @IsEnum(SortUser, { each: true })
  order_by: SortUser;
}
