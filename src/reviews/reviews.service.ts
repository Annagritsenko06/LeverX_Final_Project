import { Injectable } from '@nestjs/common';
import { VINYLSMESSAGES } from '../common/messages';
import { ReviewRepository } from './reviews.repository';
import { VinylsRepository } from '../vinyls/vinyls.repository';
import { LoggerService } from '../common/logger';
import type { VinylReviews } from '../types/types';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly vinylRepository: VinylsRepository,
    private readonly logger: LoggerService,
  ) {}

  async addReview(
    userId: string,
    vinylId: string,
    comment: string,
    reviewScore: string,
  ) {
    const vinyl = await this.vinylRepository.findVinylById(vinylId);
    if (!vinyl) {
      throw new Error(VINYLSMESSAGES.VINYL_NOT_FOUND);
    }

    const reviewScoreNumber = Number(reviewScore);
    const newReview = await this.reviewRepository.addReview(
      userId,
      vinylId,
      comment,
      reviewScoreNumber,
    );

    await this.recalculateVinylStats(vinylId);

    this.logger.log('Review created', {
      userId,
      vinylId,
      reviewScore: reviewScoreNumber,
    });
    return newReview;
  }

  async deleteReview(reviewId: string): Promise<number> {
    const review = await this.reviewRepository.findReviewById(reviewId);
    const deletedCount = await this.reviewRepository.deleteReview(reviewId);

    if (review) {
      await this.recalculateVinylStats(review.vinylId);
    }

    this.logger.log('Review deleted', { reviewId });
    return deletedCount;
  }

  async getReviewsOfVinyl(
    vinylId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<VinylReviews[]> {
    const { page = 1, limit = 10 } = options;

    const allReviews = await this.reviewRepository.getReviewsOfVinyl(vinylId);

    const offset = (page - 1) * limit;
    const paged = allReviews.slice(offset, offset + limit);

    return paged.map((review) => ({
      comment: review.comment,
      authorName: review.user?.name,
      reviewScore: Number(review.reviewScore),
    }));
  }

  private async recalculateVinylStats(vinylId: string): Promise<void> {
    const allReviews = await this.reviewRepository.getReviewsOfVinyl(vinylId);

    const averageScope =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + Number(r.reviewScore), 0) /
          allReviews.length
        : 0;

    const firstReview = allReviews.length > 0 ? allReviews[0].comment : '';

    await this.vinylRepository.updateVinylStats(
      vinylId,
      averageScope,
      firstReview,
    );
  }
}
