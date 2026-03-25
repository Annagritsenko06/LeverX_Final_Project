import {
  Controller,
  Body,
  Post,
  Get,
  Req,
  UseGuards,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import type { AuthRequest } from '../types/types';
import { AuthGuard } from '../auth/auth.guard';

import { Roles } from '../auth/guards/roles.decorators';
import { RolesGuard } from '../auth/guards/role.guard';
import { ReviewService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({ summary: 'Create review' })
  @ApiResponse({ status: 201, description: 'Review created' })
  @UseGuards(AuthGuard)
  async addReview(@Req() req, @Body() reviewDto: CreateReviewDto) {
    const { vinylId, comment, reviewScore } = reviewDto;
    const authReq = req as AuthRequest;
    const newReview = await this.reviewService.addReview(
      authReq.user.id,
      vinylId,
      comment,
      reviewScore,
    );
    return {
      review: {
        comment: newReview.comment,
        reviewScore: newReview.reviewScore,
      },
      message: 'Review successfuly created',
    };
  }
  @ApiParam({
    name: 'reviewId',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Delete(':reviewId')
  @ApiOperation({ summary: 'Delete review' })
  @ApiResponse({ status: 201, description: 'Review deleted' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(['admin'])
  async deleteReview(@Param('reviewId') reviewId: string) {
    const deletedCount = await this.reviewService.deleteReview(reviewId);
    return {
      deletedCount: deletedCount,
      message: 'Review successfuly deleted',
    };
  }

  @ApiParam({
    name: 'vinylId',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Get(':vinylId')
  @UseGuards(AuthGuard)
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    example: 10,
    description: 'Number of items to return per page',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    example: 1,
    description: 'Page number (starting from 1)',
  })
  @ApiOperation({ summary: 'Get reviews of vinyl' })
  @ApiResponse({ status: 200 })
  async getReviewsOfVinyl(
    @Param('vinylId') vinylId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const reviews = await this.reviewService.getReviewsOfVinyl(vinylId, {
      page,
      limit,
    });
    return { success: true, reviews };
  }
}
