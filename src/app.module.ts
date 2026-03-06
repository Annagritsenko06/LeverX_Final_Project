import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserController } from './users/users.controller';
import { PostsController } from './posts/posts.controller';
import { UserService } from './users/users.service';
import { PostsService } from './posts/posts.service';
import { FileHelpers } from './common/fileHelpers';
import { NotificationService } from './notifications/notifications.service';
import { AuthGuard } from './auth/auth.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PasswordHashGenerator } from './common/passwordHashGenerator';
import { UsersRepository } from './users/users.repository';
import { PostsRepository } from './posts/posts.repository';

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
    FileHelpers,
    NotificationService,
    AuthGuard,
    PasswordHashGenerator,
    UsersRepository,
    PostsRepository,
  ],
})
export class AppModule {}
