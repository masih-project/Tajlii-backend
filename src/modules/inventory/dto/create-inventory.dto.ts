import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { ObjectId } from "mongodb";

export class CreateInventoryDto {

    @ApiProperty({ example: 0 })
    @IsNotEmpty()
    count:number

    @ApiProperty({example:""})
    @IsNotEmpty()
    @IsString()
    product:string

    @ApiProperty({})
    @IsNotEmpty()
    @IsString()
    depot:string
}