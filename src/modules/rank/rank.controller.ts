import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RankService } from './rank.service';

@Controller('/')
@ApiTags('Rank')
export class RankController {
  constructor(private rankService: RankService) {}
}
