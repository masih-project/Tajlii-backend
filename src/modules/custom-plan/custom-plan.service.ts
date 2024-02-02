import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EditSasinMarketerDto } from '../rabbitmq/rabbit-publisher.service';
import { SearchLedgerDto } from './dtos/ledger.dto';
import { SasinuserType } from './dtos/user.dto';

@Injectable()
export class CustomPlanService {
  constructor(private readonly configService: ConfigService) {}

  async addmarketer(dto: SasinuserType) {
    const result = await axios.post(this.configService.get('PLAN_URL') + 'marketer/add', dto);
    console.log('ADD MARKETER TO PLAN', result.data);
  }

  async deleteMarketer(code: string) {
    const result = await axios.delete(this.configService.get('PLAN_URL') + 'marketer/' + code);
    console.log('DELETE MARKETER FROM PLAN', result.data);
  }

  async editMarketer(code: string, dto: EditSasinMarketerDto) {
    const result = await axios.patch(this.configService.get('PLAN_URL') + 'marketer/' + code, dto);
    console.log('EDIT MARKETER IN PLAN', result.data);
  }

  async searchLedger(dto: SearchLedgerDto): Promise<{ count: number; items: any[] }> {
    const result = await axios.get(this.configService.get('PLAN_URL') + 'ledger/', {
      params: dto,
    });
    return result.data;
  }
}
