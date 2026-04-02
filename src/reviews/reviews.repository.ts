import { Injectable } from '@nestjs/common';
import { Review } from '../common/db/models/review.model';
import { User } from '../common/db/models/user.model';
@Injectable()
export class ReviewRepository {
  async addReview(
    userId: string,
    vinylId: string,
    comment: string,
    reviewScore: number,
  ) {
    const newReview = await Review.create({
      userId,
      vinylId,
      comment,
      reviewScore,
    });
    return newReview.toJSON();
  }

  async findReviewById(reviewId: string) {
    return Review.findOne({ where: { reviewId } });
  }

  async deleteReview(reviewId: string): Promise<number> {
    const deletedReview = await Review.destroy({ where: { reviewId } });
    return deletedReview;
  }
  async getReviewsOfVinyl(vinylId: string) {
    const vinyls = await Review.findAll({
      where: { vinylId },
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });
    return vinyls;
  }
}
