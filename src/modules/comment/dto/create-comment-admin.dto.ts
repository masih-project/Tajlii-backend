import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateCommentByAdminDto {

    @ApiProperty({ example: '' })
    @IsString()
    @IsNotEmpty()
    comment: string;
}