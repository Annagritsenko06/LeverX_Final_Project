import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './users/users.controller';
import { PostsController } from './posts/posts.controller';
import { UserService } from './users/users.service';
import { PostsService } from './posts/posts.service';
import { FileHelpers } from './common/fileHelpers';
import { NotificationService } from './notifications/notifications.service';
import { AuthGuard } from './auth/auth.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController, UserController, PostsController],
  providers: [
    AppService,
    UserService,
    PostsService,
    FileHelpers,
    NotificationService,
    AuthGuard,
  ],
})
export class AppModule {}
