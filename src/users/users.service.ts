import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { FileHelpers } from '../common/fileHelpers';
import { USERMESSAGES } from '../common/messages';
import type { RegisterUserInput, User } from '../types/types';

@Injectable()
export class UserService {
  constructor(private readonly fileHelpers: FileHelpers) {}

  async registerUser(
    userData: RegisterUserInput,
  ): Promise<{ userId: string; name: string }> {
    const { name, lastname, email, password } = userData;

    const dataFile = process.env.DATA_FILE;
    if (!dataFile) {
      throw new Error('DATA_FILE environment variable is not defined');
    }

    const users = await this.fileHelpers.readFile<User[]>(dataFile);
    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      throw new Error(USERMESSAGES.USER_ALREADY_EXISTS);
    }

    const userId = randomUUID();
    const saltEnv = process.env.SALT_ROUNDS;
    const saltRounds = typeof saltEnv === 'string' ? Number(saltEnv) : saltEnv;
    const passwordHash = await bcrypt.hash(password, saltRounds || 10);

    const newUser: User = {
      id: userId,
      name,
      lastname,
      email,
      password: passwordHash,
    };

    users.push(newUser);
    await this.fileHelpers.writeFile(dataFile, users);

    return { userId, name };
  }

  async loginUser(
    email: string,
    password: string,
  ): Promise<{ token: string; userEmail: string }> {
    const dataFile = process.env.DATA_FILE;
    if (!dataFile) {
      throw new Error('DATA_FILE environment variable is not defined');
    }

    const users = await this.fileHelpers.readFile<User[]>(dataFile);
    const user = users.find((u) => u.email === email);

    if (!user) {
      throw new Error(USERMESSAGES.USER_NOT_FOUND);
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new Error(USERMESSAGES.WRONG_PASSWORD);
    }

    const payload = {
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
    };

    const secret = process.env.JWT_SECRET as jwt.Secret;
    const options: jwt.SignOptions = {};
    const expiresIn = process.env.JWT_EXPIRES_IN;
    if (expiresIn) {
      options.expiresIn = expiresIn as jwt.SignOptions['expiresIn'];
    }

    const token = jwt.sign(payload, secret, options);

    return { token, userEmail: user.email };
  }

  async updateUserProfile(
    email: string,
    name: string,
    lastname: string,
  ): Promise<{ name: string; lastname: string }> {
    const dataFile = process.env.DATA_FILE;
    if (!dataFile) {
      throw new Error('DATA_FILE environment variable is not defined');
    }

    const users = await this.fileHelpers.readFile<User[]>(dataFile);
    const userIndex = users.findIndex((u) => u.email === email);

    if (userIndex === -1) {
      throw new Error(USERMESSAGES.USER_NOT_FOUND);
    }

    users[userIndex].name = name;
    users[userIndex].lastname = lastname;

    await this.fileHelpers.writeFile(dataFile, users);

    return { name, lastname };
  }
}
