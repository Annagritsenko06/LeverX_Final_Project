import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { PasswordHashGenerator } from '../common/passwordHashGenerator';
import { USERMESSAGES } from '../common/messages';
import type { RegisterUserInput, User } from '../types/types';
import { UsersRepository } from './users.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordGenerator: PasswordHashGenerator,
  ) {}

  async registerUser(
    userData: RegisterUserInput,
  ): Promise<{ userId: string; name: string }> {
    const { name, lastname, email, password } = userData;

    const users = await this.usersRepository.findAll();
    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      throw new Error(USERMESSAGES.USER_ALREADY_EXISTS);
    }

    const userId = randomUUID();
    const passwordHash =
      await this.passwordGenerator.generatePasswordHash(password);

    const newUser: User = {
      id: userId,
      name,
      lastname,
      email,
      password: passwordHash,
    };

    users.push(newUser);
    await this.usersRepository.saveAll(users);

    return { userId, name };
  }

  async loginUser(
    email: string,
    password: string,
  ): Promise<{ token: string; userEmail: string }> {
    const users = await this.usersRepository.findAll();
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
    const users = await this.usersRepository.findAll();
    const userIndex = users.findIndex((u) => u.email === email);

    if (userIndex === -1) {
      throw new Error(USERMESSAGES.USER_NOT_FOUND);
    }

    users[userIndex].name = name;
    users[userIndex].lastname = lastname;

    await this.usersRepository.saveAll(users);

    return { name, lastname };
  }
}
