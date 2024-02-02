import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';

@Injectable()
export class OtpUtils {
  generateOtp(): string {
    return randomInt(9999).toString().padStart(4, '0');
  }
}

export function randomCode(length = 5) {
  return randomInt(10 ** length - 1)
    .toString()
    .padStart(length, '0');
}
