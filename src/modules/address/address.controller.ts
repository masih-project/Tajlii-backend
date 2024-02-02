import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiItemResponse } from 'src/common/decorators/api-item-response.decorator';
import { ApiPaginateResponse } from 'src/common/decorators/api-paginate-response.decorator';
import { UserAuthGuard } from 'src/guard/userAuth.guard';
import { UserAuth } from 'src/types/authorization.types';
import { AddressService } from './address.service';
import { AddressResponse } from './dto/address.dto';
import { CreateAddress } from './dto/createAddress.dto';
import { UpdateAddress } from './dto/updateAddress.dto';
import { GetUser } from '@$/common/decorators/get-user.decorator';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';

@ApiBearerAuth('access-token')
@UseGuards(UserAuthGuard)
@ApiTags('Address')
@Controller('Address')
export class AddressController {
  constructor(private addressService: AddressService) {}
  @Post('/')
  async createAddress(@GetUser() user: UserAuth, @Body() body: CreateAddress) {
    return this.addressService.createAddress(user, body);
  }

  @Get('/')
  @ApiPaginateResponse(AddressResponse)
  async getAddresses(@GetUser() user: UserAuth) {
    return this.addressService.getAddresses(user);
  }

  @Get('/:id')
  @ApiItemResponse(AddressResponse)
  async getAddress(@GetUser() user: UserAuth, @Param('id', ParseObjectIdPipe) id: string) {
    return this.addressService.getAddress(user, id);
  }

  @Delete('/:id')
  async deleteAddress(@GetUser() user: UserAuth, @Param('id', ParseObjectIdPipe) id: string) {
    return this.addressService.deleteAddress(user, id);
  }

  @Put('/:id')
  async updateAddress(
    @GetUser() user: UserAuth,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: UpdateAddress,
  ) {
    await this.addressService.updateAddress(id, body, user);
  }
}
