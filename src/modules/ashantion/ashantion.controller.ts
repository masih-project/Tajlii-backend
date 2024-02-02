import { Controller } from '@nestjs/common';
import { AshantionService } from './ashantion.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('')
@ApiTags('Ashantion')
export class AshantionController {
  constructor(private ashantionService: AshantionService) {}
}
