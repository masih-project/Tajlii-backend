import { BrandResponse } from './dto/brand.dto';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { QueryBrand } from './dto/queryBrand.dto';
import { ApiPaginateResponse } from 'src/common/decorators/api-paginate-response.decorator';
import { ApiItemResponse } from 'src/common/decorators/api-item-response.decorator';

@ApiTags('Brand')
@Controller('')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}
  @Get('/brand')
  @ApiPaginateResponse(BrandResponse)
  async getBrands(@Query() query: QueryBrand) {
    return this.brandService.getBrands(query);
  }
  @Get('/brand/:id')
  @ApiItemResponse(BrandResponse)
  async getBrand(@Param('id') id: string) {
    return this.brandService.getBrand(id);
  }
}
