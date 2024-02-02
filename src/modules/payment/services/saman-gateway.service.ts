import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface ISamanPaymentCallbackData {
  MID: number;
  TerminalId: number;
  RefNum: string;
  ResNum: string;
  State: string;
  TraceNo: number;
  Amount: number;
  AffectiveAmount: number;
  Wage: number;
  Rrn: number;
  SecurePan: string;
  Status: number;
  Token: string;
  HashedCardNumber: string;
}

@Injectable()
export class SamanGatewayService {
  constructor(private readonly configService: ConfigService) {}

  async getToken(amount: number, ResNum: string, phone?: string) {
    try {
      const getTokenUrl = this.configService.get('SAMAN_IPG_URL') + '/OnlinePG';
      const terminalId = +this.configService.get('SAMAN_TERMINAL_ID');
      const callbackUrl = this.configService.get('SAMAN_CALLBACK_URL');

      const result = await axios.post(getTokenUrl, {
        Action: 'Token',
        TerminalId: terminalId,
        Amount: amount,
        ResNum,
        RedirectUrl: callbackUrl,
        CellNumber: phone,
      });
      console.info('getToken result', result.data);

      if (!result?.data?.token) throw result;
      return `${this.configService.get('SAMAN_IPG_URL')}/SendToken?token=${result.data.token}`;
    } catch (err) {
      console.error('saman get token error:', err.message);
      throw new BadGatewayException('payment initialization failed!');
    }
  }

  async parsePaymentCallbackData(data: ISamanPaymentCallbackData) {
    return data;
  }

  async verifyTransaction(RefNum: string) {
    try {
      const terminalId = +this.configService.get('SAMAN_TERMINAL_ID');
      const verifyUrl = this.configService.get('SAMAN_VERIFY_URL');
      const result = await axios.post(verifyUrl, {
        RefNum,
        TerminalNumber: terminalId,
      });
      console.info('verifyTransaction result', result.data, result?.data.ResultCode, typeof result?.data.ResultCode);
      if (result.data?.ResultCode == 0) return true;
      return false;
    } catch (err) {
      console.error('verifyTransaction error', err.message);
      return false;
    }
  }

  async reverseTransaction(RefNum: string) {
    try {
      const terminalId = +this.configService.get('SAMAN_TERMINAL_ID');
      const reverseUrl = this.configService.get('SAMAN_REVERSE_URL');
      const result = await axios.post(reverseUrl, {
        RefNum,
        TerminalNumber: terminalId,
      });
      console.info('reverseTransaction result', result.data);

      if (result.data?.ResultCode == 0) return true;
      return false;
    } catch (err) {
      console.error('reverseTransaction error', err.message);
      return false;
    }
  }
}
