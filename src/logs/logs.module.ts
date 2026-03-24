import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LoggerModule } from '../common/logger.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [LoggerModule, AuthModule],
  controllers: [LogsController],
})
export class LogsModule {}
