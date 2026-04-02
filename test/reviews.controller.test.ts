import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { ReviewController } from '../src/reviews/reviews.controller';
import type { ReviewService } from '../src/reviews/reviews.service';
import type { AuthRequest } from '../src/types/types';
import type { CreateReviewDto } from '../src/reviews/dto/create-review.dto';

type MockReviewService = {
  addReview: ReturnType<typeof mock.fn>;
  deleteReview: ReturnType<typeof mock.fn>;
  getReviewsOfVinyl: ReturnType<typeof mock.fn>;
};

function makeMockReviewService(): MockReviewService {
  return {
    addReview: mock.fn((_uid: string, _vid: string, _c: string, _s: string) =>
      Promise.resolve({
        reviewId: 'r-1',
        comment: 'Nice',
        reviewScore: 5,
        vinylId: 'v-1',
      }),
    ),
    deleteReview: mock.fn((_id: string) => Promise.resolve(1)),
    getReviewsOfVinyl: mock.fn((_vid: string, _opts?: object) =>
      Promise.resolve([
        { comment: 'Nice', authorName: 'Alice', reviewScore: 5 },
      ]),
    ),
  };
}

function buildController(service: MockReviewService): ReviewController {
  return new ReviewController(service as unknown as ReviewService);
}

const makeReq = (userId: string): AuthRequest =>
  ({ user: { id: userId } }) as unknown as AuthRequest;

const makeDto = (
  vinylId: string,
  comment: string,
  reviewScore: string,
): CreateReviewDto => ({ vinylId, comment, reviewScore }) as CreateReviewDto;

void test('addReview: returns { review: { comment, reviewScore }, message }', async () => {
  const service = makeMockReviewService();
  const controller = buildController(service);

  const result = await controller.addReview(
    makeReq('user-id'),
    makeDto('vinyl-1', 'Nice', '5'),
  );

  assert.ok('review' in result);
  assert.ok('message' in result);
  assert.strictEqual(result.review.comment, 'Nice');
  assert.strictEqual(result.review.reviewScore, 5);
});

void test('addReview: passes correct args to service', async () => {
  const service = makeMockReviewService();
  const controller = buildController(service);

  await controller.addReview(
    makeReq('user-id'),
    makeDto('vinyl-1', 'Nice', '5'),
  );

  assert.strictEqual(service.addReview.mock.calls.length, 1);
  const [userId, vinylId, comment, reviewScore] = service.addReview.mock
    .calls[0].arguments as [string, string, string, string];
  assert.strictEqual(userId, 'user-id');
  assert.strictEqual(vinylId, 'vinyl-1');
  assert.strictEqual(comment, 'Nice');
  assert.strictEqual(reviewScore, '5');
});

void test('addReview: propagates error from service', async () => {
  const service = makeMockReviewService();
  service.addReview = mock.fn(
    (_uid: string, _vid: string, _c: string, _s: string) =>
      Promise.reject(new Error('Vinyl not found')),
  );
  const controller = buildController(service);

  await assert.rejects(
    () =>
      controller.addReview(
        makeReq('user-id'),
        makeDto('bad-vinyl', 'Nice', '5'),
      ),
    { message: 'Vinyl not found' },
  );
});

void test('getReviewsOfVinyl: returns { success: true, reviews }', async () => {
  const service = makeMockReviewService();
  const controller = buildController(service);

  const result = await controller.getReviewsOfVinyl('vinyl-1');

  assert.strictEqual(result.success, true);
  assert.ok(Array.isArray(result.reviews));
  assert.strictEqual(result.reviews.length, 1);
  assert.strictEqual(result.reviews[0].comment, 'Nice');
  assert.strictEqual(result.reviews[0].authorName, 'Alice');
  assert.strictEqual(result.reviews[0].reviewScore, 5);
});

void test('getReviewsOfVinyl: passes vinylId to service', async () => {
  const service = makeMockReviewService();
  const controller = buildController(service);

  await controller.getReviewsOfVinyl('vinyl-1');

  assert.strictEqual(
    service.getReviewsOfVinyl.mock.calls[0].arguments[0],
    'vinyl-1',
  );
});

void test('getReviewsOfVinyl: passes page and limit to service', async () => {
  const service = makeMockReviewService();
  const controller = buildController(service);

  await controller.getReviewsOfVinyl('vinyl-1', 2, 5);

  const opts = service.getReviewsOfVinyl.mock.calls[0].arguments[1] as {
    page: number;
    limit: number;
  };
  assert.strictEqual(opts.page, 2);
  assert.strictEqual(opts.limit, 5);
});

void test('deleteReview: returns { deletedCount, message }', async () => {
  const service = makeMockReviewService();
  const controller = buildController(service);

  const result = await controller.deleteReview('review-1');

  assert.ok('deletedCount' in result);
  assert.ok('message' in result);
  assert.strictEqual(result.deletedCount, 1);
});

void test('deleteReview: passes reviewId to service', async () => {
  const service = makeMockReviewService();
  const controller = buildController(service);

  await controller.deleteReview('review-1');

  assert.strictEqual(
    service.deleteReview.mock.calls[0].arguments[0],
    'review-1',
  );
});
