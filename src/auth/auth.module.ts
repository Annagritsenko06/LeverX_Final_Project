import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './guards/role.guard';
import { GoogleStrategy } from '../strategies/google.strategy';
import { UsersModule } from '../users/users.module';
import googleOauthConfig from './google-oauth.config';

@Module({
  imports: [UsersModule, ConfigModule.forFeature(googleOauthConfig)],
  providers: [AuthGuard, RolesGuard, GoogleStrategy],
  exports: [AuthGuard, RolesGuard, GoogleStrategy, UsersModule],
})
export class AuthModule {}
