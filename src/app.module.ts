import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserController } from './users/users.controller.js';
import { PostsController } from './posts/posts.controller.js';
import { UserService } from './users/users.service.js';
import { PostsService } from './posts/posts.service.js';
import { NotificationService } from './notifications/notifications.service.js';
import { AuthGuard } from './auth/auth.service.js';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PasswordHashGenerator } from './common/passwordHashGenerator.js';
import { UsersRepository } from './users/users.repository.js';
import { PostsRepository } from './posts/posts.repository.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [UserController, PostsController],
  providers: [
    UserService,
    PostsService,
    NotificationService,
    AuthGuard,
    PasswordHashGenerator,
    UsersRepository,
    PostsRepository,
  ],
})
export class AppModule {}
