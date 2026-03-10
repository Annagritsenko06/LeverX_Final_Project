import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { PasswordHashGenerator } from '../common/passwordHashGenerator';
import { USERMESSAGES } from '../common/messages';
import type { RegisterUserInput } from '../types/types';
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

    const existingUser = await this.usersRepository.findUserByEmail(email);

    if (existingUser) {
      throw new Error(USERMESSAGES.USER_ALREADY_EXISTS);
    }
    const passwordHash =
      await this.passwordGenerator.generatePasswordHash(password);

    const newUser: RegisterUserInput = {
      name,
      lastname,
      email,
      password: passwordHash,
    };

    const addedUser = await this.usersRepository.addUser(newUser);
    return { userId: addedUser.id, name: addedUser.name };
  }

  async loginUser(
    email: string,
    password: string,
  ): Promise<{ token: string; userEmail: string }> {
    const user = await this.usersRepository.findUserByEmail(email);

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

    return { token: token, userEmail: user.email };
  }

  async updateUserProfile(
    email: string,
    name: string,
    lastname: string,
  ): Promise<{ name: string; lastname: string }> {
    const updatedUser = await this.usersRepository.updateUser(
      name,
      lastname,
      email,
    );
    if (updatedUser) {
      throw new Error(USERMESSAGES.USER_NOT_FOUND);
    }
    return { name, lastname };
  }

  async getUsersWithFirstPostAndLikes(options: {
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'email';
    sortOrder?: 'ASC' | 'DESC';
    name?: string;
    email?: string;
  }) {
    return await this.usersRepository.getUsersWithFirstPostAndLikes(options);
  }
}
