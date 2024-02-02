import { Controller, Res, HttpStatus, Get } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ProvinceService } from './province.service';
import { Province } from './provice.schema';

@ApiTags('General')
@Controller('/info')
export class ProvinceController {
  constructor(private readonly proviceService: ProvinceService) {}
  @Get('/province')
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'string',
        error: 'string',
      },
    },
  })
  async getProvinces() {
    return this.proviceService.getProvinces();
  }
}
