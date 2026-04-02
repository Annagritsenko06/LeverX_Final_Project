import {
  Controller,
  Body,
  Post,
  Get,
  Put,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Request } from 'express';
import { UserService } from './users.service';
import { BadRequestException } from '@nestjs/common';
import { USERMESSAGES } from '../common/messages';
import type { AuthRequest } from '../types/types';
import { GoogleAuthGuard } from '../auth/guards/google-auth/google-auth.guard';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GoogleLoginResponseDto } from './dto/google-login-response.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Delete('profile')
  @ApiOperation({ summary: 'Delete user profile' })
  @UseGuards(AuthGuard)
  async deleteProfile(@Req() req: Request) {
    const reqAuth = req as AuthRequest;
    const email = reqAuth.user.email;
    const success = await this.userService.deleteProfile(email);
    return {
      success: success,
      message: 'Profile successfuly deleted',
    };
  }

  @Post('admin')
  @ApiOperation({ summary: 'Register admin' })
  @ApiResponse({ status: 201, description: 'Admin registered' })
  async registerAdmin(@Body() adminBody: RegisterAdminDto) {
    const result = await this.userService.registerUser(adminBody);
    return {
      success: true,
      message: USERMESSAGES.USER_REGISTERED,
      userName: result.name,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Successful logout!' })
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request) {
    const r = req as AuthRequest;
    const userId = r.user.id;

    await this.userService.logout(userId);

    return { message: 'Logged out successfully' };
  }

  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Initiate Google login',
    description: 'Redirects to Google OAuth page',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google OAuth',
  })
  @Get('google/login')
  async googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handles return from Google with token',
  })
  @ApiResponse({
    status: 200,
    type: GoogleLoginResponseDto,
  })
  async googleCallback(@Req() req: AuthRequest) {
    const email = req.user.email;

    const { token } = await this.userService.loginGoogleUser(email);

    return {
      success: true,
      token: token,
      userEmail: email,
    };
  }
  @Put('profile')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async updateProfile(@Req() req: Request, @Body() userBody: UpdateProfileDto) {
    const { name, lastname, avatar, birthdate } = userBody;
    if (!name || !lastname || !avatar || !birthdate) {
      throw new BadRequestException('All parametrs are required');
      return;
    }

    const authReq = req as AuthRequest;
    const birthdateAsDate = new Date(birthdate);
    const result = await this.userService.updateUserProfile(
      authReq.user.email,
      name,
      lastname,
      birthdateAsDate,
      avatar,
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

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async showProfile(@Req() req: AuthRequest) {
    const email = req.user.email;

    const userProfile = await this.userService.showProfile(email);

    return {
      success: true,
      profile: userProfile,
    };
  }
}
