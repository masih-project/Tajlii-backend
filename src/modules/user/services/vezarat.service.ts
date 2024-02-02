import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VezaratRegisterMarketerDto } from '../dto/vezarat.dto';
import { Client } from 'nestjs-soap';

@Injectable()
export class VezaratService {
  constructor(
    @Inject('VEZARAT_SOAP_CLIENT') private readonly client: Client,
    private readonly configService: ConfigService,
  ) {}

  async registerMarketer(dto: VezaratRegisterMarketerDto): Promise<string> {
    try {
      const result = await this.client.RegisterAsync({
        username: this.configService.get('VEZARAT_USERNAME'),
        password: this.configService.get('VEZARAT_PASSWORD'),
        ...dto,
      });
      if (result[0].RegisterResult.startsWith('error')) throw new Error(result[0].RegisterResult);
      return result[0].RegisterResult;
    } catch (err) {
      console.info('register marketer in vezarat failed', err.message);
    }
  }

  async revokeMarketer(nationalCode: string): Promise<boolean> {
    try {
      const result = await this.client.RevokeAsync({
        username: this.configService.get('VEZARAT_USERNAME'),
        password: this.configService.get('VEZARAT_PASSWORD'),
        nationalCode,
        IsCompanyRequest: true,
      });
      if (result[0].RevokeResult.startsWith('error')) throw new Error(result[0].RevokeResult);
      return result[0].RevokeResult;
    } catch (err) {
      console.info('revoke marketer in vezarat failed', err.message);
    }
  }

  async reactiveMarketer(nationalCode: string): Promise<boolean> {
    try {
      const result = await this.client.ReActiveAsync({
        username: this.configService.get('VEZARAT_USERNAME'),
        password: this.configService.get('VEZARAT_PASSWORD'),
        nationalCode,
        IsCompanyRequest: true,
      });
      if (result[0].ReActiveResult.startsWith('error')) throw new Error(result[0].ReActiveResult);
      return result[0].ReActiveResult;
    } catch (err) {
      console.info('reactive marketer in vezarat failed', err.message);
    }
  }

  async getPersonCode(nationalCode: string): Promise<string> {
    try {
      const result = await this.client.GetPersonCodeAsync({
        username: this.configService.get('VEZARAT_USERNAME'),
        password: this.configService.get('VEZARAT_PASSWORD'),
        nationalCode,
      });
      if (result[0].GetPersonCodeResult.startsWith('error')) throw new Error(result[0].GetPersonCodeResult);
      return result[0].GetPersonCodeResult;
    } catch (err) {
      console.info('get person code in vezarat failed', err.message);
    }
  }

  async getPersonCompany(nationalCode: string): Promise<string> {
    try {
      const result = await this.client.GetPersonCompanyAsync({
        username: this.configService.get('VEZARAT_USERNAME'),
        password: this.configService.get('VEZARAT_PASSWORD'),
        nationalCode,
      });
      if (result[0].GetPersonCompanyResult.startsWith('error')) throw new Error(result[0].GetPersonCompanyResult);
      return result[0].GetPersonCompanyResult;
    } catch (err) {
      console.info('get person company in vezarat failed', err.message);
    }
  }

  async getPersonStatus(nationalCode: string): Promise<string> {
    try {
      const result = await this.client.GetPersonStatusAsync({
        username: this.configService.get('VEZARAT_USERNAME'),
        password: this.configService.get('VEZARAT_PASSWORD'),
        nationalCode,
      });
      if (result[0].GetPersonStatusResult.startsWith('error')) throw new Error(result[0].GetPersonStatusResult);
      return result[0].GetPersonStatusResult;
    } catch (err) {
      console.info('get person status in vezarat failed', err.message);
    }
  }
}
