import { Injectable } from '@nestjs/common';
import type { User as UserType, RegisterUserInput } from '../types/types';
import { User } from '../common/db/models/user.model';
import { Review } from '../common/db/models/review.model';
import { Vinyl } from '../common/db/models/vinyl.model';

@Injectable()
export class UsersRepository {
  async addUser(user: RegisterUserInput): Promise<UserType> {
    const createdUser = await User.create({
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      googleSub: user.googleSub,
      roleId: user.roleId,
    });

    return createdUser.toJSON();
  }

  async findUserByGoogleSub(googleSub: string | undefined) {
    if (!googleSub) return null;

    return User.findOne({
      where: { googleSub: googleSub },
    });
  }

  async findUser(email: string) {
    return User.findOne({
      where: { email: email },
    });
  }

  async updateUserByGoogleSub(
    googleSub: string | undefined,
    updateData: Partial<UserType>,
  ) {
    const user = await this.findUserByGoogleSub(googleSub);
    if (!user) return null;

    if (updateData.name !== undefined) user.name = updateData.name;
    if (updateData.lastname !== undefined) user.lastname = updateData.lastname;
    if (updateData.email !== undefined) user.email = updateData.email;
    if (updateData.avatar !== undefined) user.avatar = updateData.avatar;

    await user.save();
    return user.toJSON();
  }

  async updateUserByEmail(email: string, updateData: Partial<UserType>) {
    const user = await this.findUser(email);
    if (!user) return null;

    if (updateData.name !== undefined) user.name = updateData.name;
    if (updateData.lastname !== undefined) user.lastname = updateData.lastname;
    if (updateData.avatar !== undefined) user.avatar = updateData.avatar;

    await user.save();
    return user.toJSON();
  }

  async updateUserGoogleSub(userId: string, googleSub: string) {
    const user = await User.findByPk(userId);
    if (!user) return null;

    user.googleSub = googleSub;
    await user.save();

    return user.toJSON();
  }

  async updateUser(
    name: string,
    lastname: string,
    email: string,
    birthdate: Date,
    avatar: string,
  ): Promise<boolean> {
    const [updatedCount] = await User.update(
      {
        name: name,
        lastname: lastname,
        avatar: avatar,
        birthdate: birthdate,
      },
      {
        where: { email },
      },
    );
    return updatedCount > 0;
  }

  async deleteUser(email: string): Promise<number> {
    const deletedUser = await User.destroy({ where: { email } });
    return deletedUser;
  }
  async updateSessionVersion(id: string, sessionVersion: number) {
    const [updatedUserSession] = await User.update(
      { sessionVersion: sessionVersion },
      { where: { id } },
    );
    return updatedUserSession > 0;
  }
  async findUserByEmail(email: string): Promise<UserType | null> {
    const user = await User.findOne({
      where: { email },
    });
    if (!user) return null;
    return user.toJSON();
  }

  async findUserProfileByEmail(email: string) {
    const user = await User.findOne({
      attributes: { exclude: ['roleId', 'id', 'googleSub', 'sessionVersion'] },
      where: { email },
      include: [
        {
          model: Review,
          as: 'reviews',
          attributes: { exclude: ['userId', 'reviewId', 'vinylId'] },
        },
        {
          model: Vinyl,
          as: 'vinyls',
          through: { attributes: [] },
          attributes: { exclude: ['vinylId'] },
        },
      ],
    });

    return user;
  }
}
