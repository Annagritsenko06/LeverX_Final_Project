import { Injectable } from '@nestjs/common';
import type { User as UserType, RegisterUserInput } from '../types/types';
import { sequelize } from '../common/db/db';
import { User } from '../common/db/models/user.model';

@Injectable()
export class UsersRepository {
  async addUser(user: RegisterUserInput): Promise<UserType> {
    const createdUser = await User.create({
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      password: user.password,
    });

    return createdUser.toJSON() as UserType;
  }
  async updateUser(
    name: string,
    lastname: string,
    email: string,
  ): Promise<boolean> {
    const [updatedCount] = await User.update(
      {
        name: name,
        lastname: lastname,
      },
      {
        where: { email },
      },
    );
    return updatedCount > 0;
  }

  async findUserByEmail(email: string): Promise<UserType | null> {
    const user = await User.findOne({
      where: { email },
    });
    if (!user) return null;
    return user.toJSON() as UserType;
  }

  async findUserById(id: string): Promise<UserType | null> {
    const user = await User.findOne({
      where: { id },
    });
    if (!user) return null;
    return user.toJSON() as UserType;
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
