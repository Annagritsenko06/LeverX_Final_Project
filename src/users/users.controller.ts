import {
  Controller,
  Body,
  Post,
  Get,
  Put,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Request } from 'express';
import { UserService } from './users.service';
import { BadRequestException } from '@nestjs/common';
import { NotificationService } from '../notifications/notifications.service';
import { USERMESSAGES} from '../common/messages';
import type { AuthRequest } from '../types/types';
import { AuthGuard } from '../auth/auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly notification: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async register(@Body() userBody: RegisterUserDto) {
    const result = await this.userService.registerUser(userBody);
    return {
      success: true,
      message: USERMESSAGES.USER_REGISTERED,
      userName: result.name,
    };
  }

  @Post('login')
  async login(@Body() userBody: LoginDto) {
    const { email, password } = userBody;
    const result = await this.userService.loginUser(email, password);
    return {
      success: true,
      token: result.token,
      userEmail: result.userEmail,
    };
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  async updateProfile(@Req() req: Request, @Body() userBody: UpdateProfileDto) {
    const { name, lastname } = userBody;

    if (!name || !lastname) {
      throw new BadRequestException('Name and lastname are required');
      return;
    }

    const authReq = req as AuthRequest;
    const result = await this.userService.updateUserProfile(
      authReq.user.email,
      name,
      lastname,
    );

    this.eventEmitter.emit(
      'profileUpdated',
      authReq.user.email,
      name,
      lastname,
    );

    return {
      success: true,
      message: USERMESSAGES.USER_UPDATED,
      NewuserName: result.name,
      NewLastname: result.lastname,
    };
  }

  @Get('auth-status')
  @UseGuards(AuthGuard)
  getAuthStatus(@Req() req: Request) {
    const authReq = req as AuthRequest;
    return {
      name: authReq.user.name,
      lastname: authReq.user.lastname,
      email: authReq.user.email,
    };
  }
}
