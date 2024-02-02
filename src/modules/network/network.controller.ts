import { Controller } from '@nestjs/common';
import { NetworkService } from './network.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('/')
@ApiTags('Network')
export class NetworkController {
  constructor(private networkService: NetworkService) {}
}
