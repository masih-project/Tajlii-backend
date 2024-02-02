import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KavenegarApi } from 'kavenegar';

type KavenegarPattern =
  | 'LoginUsers'
  | 'WelcomMarketer'
  | 'VerifyCode'
  | 'WelcomCustomer'
  | 'TrackOrder'
  | 'NotifyOrderCreation'
  | 'CooperationTermination'
  | 'WelcomToSmartCity';

@Injectable()
export class SmsUtils {
  constructor(private config: ConfigService) {}
  async sendOtp(message: string, receptor: string, otp: string) {
    try {
      const apikey = this.config.get<string>('KAVENEGAR_API_KEY');
      const api = KavenegarApi({
        apikey,
      });
      api.VerifyLookup(
        {
          receptor: receptor,
          template: 'LoginUsers',
          token: otp,
        },
        (res: any) => {
          // console.error(res);
        },
      );
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  async sendVerifyCode(receptor: string, otp: string) {
    return this.sendPattern('VerifyCode', receptor, {
      token: otp,
    });
  }

  async sendWelcomCustomerMessage(receptor: string, username: string) {
    return this.sendPattern('WelcomCustomer', receptor, {
      token: username,
    });
  }

  async sendWelcomMarketerMessage(receptor: string, username: string, code: string) {
    return this.sendPattern('WelcomMarketer', receptor, {
      token: username,
      token2: code,
    });
  }

  async sendOrderTrackingUrl(receptor: string, orderCode: string, trackingUrl: string) {
    return this.sendPattern('TrackOrder', receptor, {
      token: orderCode,
      token2: trackingUrl,
    });
  }

  async sendWelocmeToSmartCity(receptor: string) {
    return this.sendPattern('WelcomToSmartCity', receptor, {
      token: 'https://my-smartcity.ir/register',
    });
  }

  async sendOrderCreationToAdmins(orderCode: string, orderUrl: string) {
    const adminReceptors = ['09122543609', '09120407980'];
    return Promise.all(
      adminReceptors.map((x) =>
        this.sendPattern('NotifyOrderCreation', x, {
          token: orderCode,
          token2: orderUrl,
        }),
      ),
    );
  }

  async sendCooperationTermination(receptor: string, fullname: string) {
    return this.sendPattern('CooperationTermination', receptor, {
      token: fullname,
    });
  }

  private async sendPattern(
    pattern: KavenegarPattern,
    receptor: string,
    args: { token: string; token2?: string; token3?: string },
  ) {
    try {
      const apikey = this.config.get<string>('KAVENEGAR_API_KEY');
      const api = KavenegarApi({
        apikey,
      });
      api.VerifyLookup(
        {
          receptor: receptor,
          template: pattern,
          ...args,
        },
        (res: any) => {
          // console.error('kavenegar res', res);
        },
      );
    } catch (error) {
      console.error('error in send pattern', error);
      throw error;
    }
  }
}
