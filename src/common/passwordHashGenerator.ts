import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class PasswordHashGenerator {
  async generatePasswordHash(password: string): Promise<string> {
    const saltEnv = process.env.SALT_ROUNDS;
    const saltRounds = typeof saltEnv === 'string' ? Number(saltEnv) : saltEnv;
    const passwordHash = await bcrypt.hash(password, saltRounds || 10);
    return passwordHash;
  }
}
