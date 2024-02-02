import { ContractService } from '@$/modules/contract/services/contract.service';
import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';
import { AdminGuard } from '../guards/admin.guard';
import { AssessContractDto, SearchContractDto } from '@$/modules/contract/dtos/contract.dto';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/contract')
@Controller('admin/contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get('/:id')
  async getContract(@Param('id', ParseObjectIdPipe) id: string) {
    return this.contractService.getContract(id);
  }

  @Patch('/:id')
  async editContract(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: AssessContractDto) {
    return this.contractService.assessContract(id, dto);
  }

  @Get('/')
  async searchContract(@Query() dto: SearchContractDto) {
    return this.contractService.serachContract(dto);
  }
}
