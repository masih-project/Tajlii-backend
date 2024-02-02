import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { ApiPaginateResponse } from '@$/common/decorators/api-paginate-response.decorator';
import { AdminGuard } from '../guards/admin.guard';
import { ComplaintResponse } from '@$/modules/complaint/dtos/complaint.dto';
import { ComplaintService } from '@$/modules/complaint/services/complaint.service';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/complaint')
@Controller('admin/complaint')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Get('/:id')
  @ApiOkResponse({ type: ComplaintResponse })
  async getComplaint(@Param('id', ParseObjectIdPipe) id: string) {
    return this.complaintService.getComplaint(id);
  }

  @Get('/')
  @ApiPaginateResponse(ComplaintResponse)
  async searchComplaints() {
    return this.complaintService.searchComplaints();
  }
}
