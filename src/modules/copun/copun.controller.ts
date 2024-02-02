import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CouponService } from './copun.service';

@Controller('/')
@ApiTags('Copun')
export class CopunController {
  constructor(private readonly copunService: CouponService) {}
}
