import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Secret, sign, verify } from 'jsonwebtoken';
@Injectable()
export class JWTUtils {
  constructor(private config: ConfigService) {}
  async generateToken(payload = {}, expired = '20d') {
    const JWT_SECRET = this.config.get<string>('JWT_SECRET');
    return await sign(payload, JWT_SECRET, {
      expiresIn: expired,
    });
  }
  async verifyToken(token: string) {
    const JWT_SECRET = this.config.get<string>('JWT_SECRET');
    return await verify(token, JWT_SECRET);
  }
}
