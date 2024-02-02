import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';
import { AdminGuard } from '../guards/admin.guard';
import { ContactUsService } from '@$/modules/contact-us/services/contactus.service';
import { SearchContactusDto } from '@$/modules/contact-us/dtos/contactus.dto';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/contact-us')
@Controller('admin/contact-us')
export class ContactusController {
  constructor(private readonly contactusService: ContactUsService) {}

  @Get('/:id')
  async getOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.contactusService.getOne(id);
  }

  @Get('/')
  async search(@Query() dto: SearchContactusDto) {
    return this.contactusService.search(dto);
  }
}
