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
import type { Request, Response } from 'express';
import { UserService } from './users.service';
import { NotificationService } from '../notifications/notifications.service';
import { HttpStatus } from '../common/constants';
import { USERMESSAGES, MESSAGES } from '../common/messages';
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
  async register(
    @Res() res: Response,
    @Body() userBody: RegisterUserDto,
  ): Promise<void> {
    try {
      const result = await this.userService.registerUser(userBody);
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: USERMESSAGES.USER_REGISTERED,
        userName: result.name,
      });
    } catch (error) {
      if (!(error instanceof Error)) {
        res.status(HttpStatus.SERVER_ERROR).json({
          error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }

      if (error.message === USERMESSAGES.USER_ALREADY_EXISTS) {
        res.status(HttpStatus.CONFLICT).json({ error: error.message });
      } else {
        res.status(HttpStatus.SERVER_ERROR).json({
          error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  @Post('login')
  async login(@Res() res: Response, @Body() userBody: LoginDto): Promise<void> {
    try {
      const { email, password } = userBody;
      const result = await this.userService.loginUser(email, password);
      res.json({
        success: true,
        token: result.token,
        userEmail: result.userEmail,
      });
    } catch (error) {
      console.error('Login error:', error);
      if (!(error instanceof Error)) {
        res.status(HttpStatus.SERVER_ERROR).json({
          error: MESSAGES.ERROR_READING_FILE,
        });
        return;
      }

      if (error.message === USERMESSAGES.USER_NOT_FOUND) {
        res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
      } else if (error.message === USERMESSAGES.WRONG_PASSWORD) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          error: error.message,
        });
      } else {
        res.status(HttpStatus.SERVER_ERROR).json({
          error: MESSAGES.ERROR_READING_FILE,
        });
      }
    }
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Req() req: Request,
    @Res() res: Response,
    @Body() userBody: UpdateProfileDto,
  ): Promise<void> {
    try {
      const { name, lastname } = userBody;

      if (!name || !lastname) {
        res.status(HttpStatus.CONFLICT).send(MESSAGES.DATA_IS_EMPTY);
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

      res.status(HttpStatus.OK).json({
        success: true,
        message: USERMESSAGES.USER_UPDATED,
        NewuserName: result.name,
        NewLastname: result.lastname,
      });
    } catch (error) {
      if (!(error instanceof Error)) {
        res.status(HttpStatus.SERVER_ERROR).json({
          error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }

      if (error.message === USERMESSAGES.USER_NOT_FOUND) {
        res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
      } else {
        res.status(HttpStatus.SERVER_ERROR).json({
          error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  @Get('auth-status')
  @UseGuards(AuthGuard)
  getAuthStatus(@Req() req: Request, @Res() res: Response): void {
    res.status(HttpStatus.OK).json({
      name: (req as AuthRequest).user.name,
      lastname: (req as AuthRequest).user.lastname,
      email: (req as AuthRequest).user.email,
    });
  }
}
