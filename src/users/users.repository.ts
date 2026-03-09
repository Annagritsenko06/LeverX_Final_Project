import { Injectable } from '@nestjs/common';
import { DataRepository } from '../common/dataRepository';
import type { User as UserType, RegisterUserInput } from '../types/types';

@Injectable()
export class UsersRepository {
  constructor(private readonly dataRepository: DataRepository) {}

  async addUser(user: RegisterUserInput): Promise<UserType> {
    const newUser = await this.dataRepository.addUser(user);
    return newUser;
  }
  async updateUser(
    name: string,
    lastname: string,
    email: string,
  ): Promise<boolean> {
    return this.dataRepository.updateUser(name, lastname, email);
  }

  async findUserByEmail(email: string): Promise<UserType | null> {
    return this.dataRepository.findUserByEmail(email);
  }

  async findUserById(id: string): Promise<UserType | null> {
    return this.dataRepository.findUserById(id);
  }
}
