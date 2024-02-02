import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
@Injectable()
export class HashUtils {
  async hashString(str: string) {
    const hash = await bcrypt.hash(str, 10);
    return hash;
  }
  async verifyPassword(password: string, hashPassword: string) {
    return await bcrypt.compare(password, hashPassword);
  }
}
