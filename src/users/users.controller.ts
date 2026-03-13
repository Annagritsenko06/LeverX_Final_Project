import {
  Controller,
  Body,
  Post,
  Get,
  Put,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Request } from 'express';
import { UserService } from './users.service.js';
import { BadRequestException } from '@nestjs/common';
import { NotificationService } from '../notifications/notifications.service.js';
import { USERMESSAGES } from '../common/messages.js';
import type { AuthRequest } from '../types/types.js';
import { AuthGuard } from '../auth/auth.service.js';
import { RegisterUserDto } from './dto/register-user.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly notification: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered' })
  async register(@Body() userBody: RegisterUserDto) {
    const result = await this.userService.registerUser(userBody);
    return {
      success: true,
      message: USERMESSAGES.USER_REGISTERED,
      userName: result.name,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'JWT token returned' })
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
  @ApiBearerAuth()
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

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getUsersWithFirstPostAndLikes(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('sortBy') sortBy: 'name' | 'email' = 'name',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('name') name?: string,
    @Query('email') email?: string,
  ) {
    const data = await this.userService.getUsersWithFirstPostAndLikes({
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
      name,
      email,
    });

    return {
      success: true,
      data,
    };
  }
}
