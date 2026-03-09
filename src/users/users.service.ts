import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { PasswordHashGenerator } from '../common/passwordHashGenerator';
import { USERMESSAGES } from '../common/messages';
import type { RegisterUserInput } from '../types/types';
import { UsersRepository } from './users.repository';
import { sequelize } from '../common/db/db';

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
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'ASC',
      name,
      email,
    } = options;

    const offset = (page - 1) * limit;

    const allowedSort = ['name', 'email'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const where: string[] = [];
    const replacements: any = { limit, offset };

    if (name) {
      where.push('u.name LIKE :name');
      replacements.name = `%${name}%`;
    }

    if (email) {
      where.push('u.email LIKE :email');
      replacements.email = `%${email}%`;
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
    SELECT *
    FROM (
      SELECT
        u.id,
        u.name,
        u.lastname,
        u.email,
        p.postId AS firstPostId,
        p.title AS firstPostTitle,
        JSON_LENGTH(p.likes) AS likesCount,
        ROW_NUMBER() OVER (
          PARTITION BY u.id
          ORDER BY p.createdData
        ) AS rn
      FROM Users u
      LEFT JOIN Posts p ON p.authorId = u.id
      ${whereSql}
    ) t
    WHERE rn = 1
    ORDER BY t.${safeSortBy} ${safeSortOrder}
    LIMIT :limit OFFSET :offset
  `;

    const [rows] = await sequelize.query(sql, { replacements });

    return rows;
  }
}
