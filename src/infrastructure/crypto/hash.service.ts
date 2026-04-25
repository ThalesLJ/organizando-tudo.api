import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const PASSWORD_SALT_ROUNDS = 12;

@Injectable()
export class HashService {
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, PASSWORD_SALT_ROUNDS);
  }

  async verify(hash: string, plainValue: string): Promise<boolean> {
    if (!hash || typeof hash !== 'string' || !plainValue || typeof plainValue !== 'string') {
      return false;
    }

    try {
      return await bcrypt.compare(plainValue, hash);
    } catch {
      return false;
    }
  }
}
