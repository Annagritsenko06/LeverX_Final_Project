import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { USERMESSAGES } from '../common/messages';
import type { RegisterUserInput } from '../types/types';
import { UsersRepository } from './users.repository';
import { GoogleRegisterUserInput } from '../types/types';
import { LoggerService } from '../common/logger';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(
    userData: RegisterUserInput,
  ): Promise<{ userId: string; name: string }> {
    const { name, lastname, email, roleId } = userData;
    const existingUser = await this.usersRepository.findUserByEmail(email);

    if (existingUser) {
      throw new Error(USERMESSAGES.USER_ALREADY_EXISTS);
    }

    const newUser: RegisterUserInput = {
      name,
      lastname,
      email,
      roleId: roleId,
    };

    const addedUser = await this.usersRepository.addUser(newUser);
    this.logger.log('User registered', { email, name });
    return { userId: addedUser.id, name: addedUser.name };
  }
  async validateGoogleUser(googleUser: GoogleRegisterUserInput) {
    let user:
      | Awaited<ReturnType<typeof this.usersRepository.findUserByGoogleSub>>
      | Awaited<ReturnType<typeof this.usersRepository.findUserByEmail>> = null;
    if (googleUser.googleSub) {
      user = await this.usersRepository.findUserByGoogleSub(
        googleUser.googleSub,
      );
    }

    if (user) {
      const updatedUser = await this.usersRepository.updateUserByGoogleSub(
        googleUser.googleSub,
        {
          name: googleUser.name,
          lastname: googleUser.lastname,
          email: googleUser.email,
          avatar: googleUser.avatar,
        },
      );
      return updatedUser;
    }

    user = await this.usersRepository.findUserByEmail(googleUser.email);

    if (user) {
      if (googleUser.googleSub) {
        await this.usersRepository.updateUserGoogleSub(
          user.id,
          googleUser.googleSub,
        );
      }

      const updatedUser = await this.usersRepository.updateUserByEmail(
        googleUser.email,
        {
          name: googleUser.name,
          lastname: googleUser.lastname,
          avatar: googleUser.avatar,
        },
      );

      return updatedUser;
    }

    const newUser = await this.usersRepository.addUser({
      name: googleUser.name,
      lastname: googleUser.lastname || '',
      email: googleUser.email,
      googleSub: googleUser.googleSub,
      avatar: googleUser.avatar,
    });

    return newUser;
  }
  async loginGoogleUser(
    email: string,
  ): Promise<{ token: string; userEmail: string }> {
    return this.generateToken(email);
  }

  async generateToken(
    email: string,
  ): Promise<{ token: string; userEmail: string }> {
    const user = await this.usersRepository.findUserByEmail(email);

    if (!user) {
      throw new Error(USERMESSAGES.USER_NOT_FOUND);
    }

    const newVersion = (user.sessionVersion || 0) + 1;
    await this.usersRepository.updateSessionVersion(user.id, newVersion);
    const payload = {
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      sessionVersion: newVersion,
      roleId: user.roleId,
      googleSub: user.googleSub,
    };

    const secret = this.configService.get<string>('JWT_SECRET') as jwt.Secret;
    const options: jwt.SignOptions = {};
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN');

    if (expiresIn) {
      options.expiresIn = expiresIn as jwt.SignOptions['expiresIn'];
    }

    const token = jwt.sign(payload, secret, options);

    return { token, userEmail: user.email };
  }

  async logout(userId: string) {
    const newSessionVersion = Math.floor(Math.random() * 1_000_000);
    await this.usersRepository.updateSessionVersion(userId, newSessionVersion);
    return { message: 'Logged out' };
  }

  async updateUserProfile(
    email: string,
    name: string,
    lastname: string,
    birthdate: Date,
    avatar: string,
  ): Promise<{ name: string; lastname: string }> {
    const updatedUser = await this.usersRepository.updateUser(
      name,
      lastname,
      email,
      birthdate,
      avatar,
    );
    if (!updatedUser) {
      throw new Error(USERMESSAGES.USER_NOT_FOUND);
    }
    this.logger.log('User profile updated', { email });
    return { name, lastname };
  }

  async showProfile(email: string) {
    const userProfile =
      await this.usersRepository.findUserProfileByEmail(email);
    return userProfile ? userProfile.toJSON() : null;
  }

  async deleteProfile(email: string): Promise<boolean> {
    const result = await this.usersRepository.deleteUser(email);
    if (result < 0) {
      throw new Error(USERMESSAGES.USER_NOT_FOUND);
    }
    this.logger.log('User profile deleted', { email });
    return true;
  }
}
