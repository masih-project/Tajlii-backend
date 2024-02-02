import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export const MARKETER_TOKEN_STRATEGY = 'MARKETER_TOKEN_STRATEGY';
@Injectable()
export class AdminAccessTokenStrategy extends PassportStrategy(Strategy, MARKETER_TOKEN_STRATEGY) {
  constructor(configService: ConfigService) {
    super({
      secretOrKey: configService.get<string>('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }

  async validate(payload: IMarketerTokenPayload) {
    return payload;
  }
}

export interface IMarketerTokenPayload {
  _id: string;
}
