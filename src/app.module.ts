import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { StripeModule } from './stripe/stripe.module';
import { UsersModule } from './users/users.module';
import { VinylsModule } from './vinyls/vinyls.module';
import { ReviewsModule } from './reviews/reviews.module';
import { LogsModule } from './logs/logs.module';
import { LoggerModule } from './common/logger.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ErrorsInterceptor } from './common/interceptors/errors.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    LoggerModule,
    AuthModule,
    UsersModule,
    VinylsModule,
    ReviewsModule,
    LogsModule,
    NotificationsModule,
    StripeModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor,
    },
  ],
})
export class AppModule {}
