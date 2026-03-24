import { Module } from '@nestjs/common';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';
import { ReviewRepository } from './reviews.repository';
import { VinylsModule } from '../vinyls/vinyls.module';
import { LoggerModule } from '../common/logger.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [VinylsModule, LoggerModule, AuthModule],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService],
})
export class ReviewsModule {}
