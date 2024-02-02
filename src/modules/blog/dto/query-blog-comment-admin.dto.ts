import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsOptional } from "class-validator";

export class QueryBlogCommentByAdminDto {
  @ApiProperty({ example: 10, required: false })
  @IsNumberString()
  @IsOptional()
  limit: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumberString()
  @IsOptional()
  skip: string;
}
