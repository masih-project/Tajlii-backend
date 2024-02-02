import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContactUsService } from './services/contactus.service';
import { UserOptionalGuard } from '@$/guard/userAuth.guard';
import { ContactUsDto } from './dtos/contactus.dto';
import { GetUser } from '@$/common/decorators/get-user.decorator';

@ApiTags('contact-us')
@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly service: ContactUsService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(UserOptionalGuard)
  @Post('/')
  async addContactus(@Body() dto: ContactUsDto, @GetUser() user?: { _id: string }) {
    return this.service.addContactus(dto, user?._id);
  }
}
