import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { ReviewService } from '../src/reviews/reviews.service';
import type { ReviewRepository } from '../src/reviews/reviews.repository';
import type { VinylsRepository } from '../src/vinyls/vinyls.repository';
import type { LoggerService } from '../src/common/logger';

const vinylData = {
  vinylId: 'vinyl-1',
  name: 'Dark Side of the Moon',
  authorName: 'Pink Floyd',
  description: 'Classic album',
  price: 25,
  image: 'cover.jpg',
};

const reviewData = {
  reviewId: 'review-1',
  userId: 'user-1',
  vinylId: 'vinyl-1',
  comment: 'Great album!',
  reviewScore: 5,
};

type ReviewRow = {
  comment: string;
  reviewScore: number;
  user?: { name: string };
};

const mockLogger = {
  log: mock.fn((_msg: string, _meta?: object) => undefined),
  error: mock.fn((_msg: string) => undefined),
  warn: mock.fn((_msg: string) => undefined),
} satisfies Partial<LoggerService>;

function makeMockReviewRepo() {
  return {
    addReview: mock.fn((_uid: string, _vid: string, _c: string, _s: number) =>
      Promise.resolve(reviewData),
    ),
    deleteReview: mock.fn((_id: string) => Promise.resolve(1)),
    findReviewById: mock.fn((_id: string) =>
      Promise.resolve({ vinylId: 'vinyl-1', reviewId: 'review-1' } as {
        vinylId: string;
        reviewId: string;
      } | null),
    ),
    getReviewsOfVinyl: mock.fn((_vid: string) =>
      Promise.resolve([] as ReviewRow[]),
    ),
  };
}

function makeMockVinylsRepo() {
  return {
    findVinylById: mock.fn((_id: string) =>
      Promise.resolve(vinylData as typeof vinylData | null),
    ),
    updateVinylStats: mock.fn((_id: string, _avg: number, _first: string) =>
      Promise.resolve(undefined),
    ),
    addVinyl: mock.fn(() => Promise.resolve(vinylData)),
    updateVunyl: mock.fn(() =>
      Promise.resolve(vinylData as typeof vinylData | null),
    ),
    searchVinylByName: mock.fn(() =>
      Promise.resolve(null as typeof vinylData | null),
    ),
    deleteVinyl: mock.fn(() => Promise.resolve(1)),
    getAllVinyls: mock.fn(() => Promise.resolve([] as (typeof vinylData)[])),
  };
}

function buildService(
  reviewRepo: ReturnType<typeof makeMockReviewRepo>,
  vinylsRepo: ReturnType<typeof makeMockVinylsRepo>,
): ReviewService {
  return new ReviewService(
    reviewRepo as unknown as ReviewRepository,
    vinylsRepo as unknown as VinylsRepository,
    mockLogger as unknown as LoggerService,
  );
}

const threeReviews: ReviewRow[] = [
  { comment: 'Review 1', reviewScore: 5, user: { name: 'Alice' } },
  { comment: 'Review 2', reviewScore: 4, user: { name: 'Bob' } },
  { comment: 'Review 3', reviewScore: 3, user: { name: 'Carol' } },
];

void test('addReview: happy path — returns created review', async () => {
  const reviewRepo = makeMockReviewRepo();
  const vinylsRepo = makeMockVinylsRepo();
  const service = buildService(reviewRepo, vinylsRepo);

  const result = await service.addReview(
    'user-1',
    'vinyl-1',
    'Great album!',
    '5',
  );

  assert.deepStrictEqual(result, reviewData);
  assert.strictEqual(vinylsRepo.findVinylById.mock.calls.length, 1);
  assert.strictEqual(
    vinylsRepo.findVinylById.mock.calls[0].arguments[0],
    'vinyl-1',
  );
  assert.strictEqual(reviewRepo.addReview.mock.calls.length, 1);
  const [uid, vid, comment, score] =
    reviewRepo.addReview.mock.calls[0].arguments;
  assert.strictEqual(uid, 'user-1');
  assert.strictEqual(vid, 'vinyl-1');
  assert.strictEqual(comment, 'Great album!');
  assert.strictEqual(score, 5);
});

void test('addReview: throws if vinyl not found', async () => {
  const reviewRepo = makeMockReviewRepo();
  const vinylsRepo = makeMockVinylsRepo();
  vinylsRepo.findVinylById = mock.fn((_id: string) =>
    Promise.resolve(null as typeof vinylData | null),
  );
  const service = buildService(reviewRepo, vinylsRepo);

  await assert.rejects(
    () => service.addReview('user-1', 'unknown-vinyl', 'Nice', '4'),
    { message: 'Vinyl not found' },
  );
  assert.strictEqual(reviewRepo.addReview.mock.calls.length, 0);
});

void test('addReview: reviewScore is converted to number', async () => {
  const reviewRepo = makeMockReviewRepo();
  const vinylsRepo = makeMockVinylsRepo();
  const service = buildService(reviewRepo, vinylsRepo);

  await service.addReview('user-1', 'vinyl-1', 'Good', '3');

  const score = reviewRepo.addReview.mock.calls[0].arguments[3];
  assert.strictEqual(typeof score, 'number');
  assert.strictEqual(score, 3);
});

void test('deleteReview: happy path — returns deletedCount', async () => {
  const reviewRepo = makeMockReviewRepo();
  const vinylsRepo = makeMockVinylsRepo();
  const service = buildService(reviewRepo, vinylsRepo);

  const result = await service.deleteReview('review-1');

  assert.strictEqual(result, 1);
  assert.strictEqual(reviewRepo.deleteReview.mock.calls.length, 1);
  assert.strictEqual(
    reviewRepo.deleteReview.mock.calls[0].arguments[0],
    'review-1',
  );
});

void test('deleteReview: recalculates vinyl stats after deletion', async () => {
  const reviewRepo = makeMockReviewRepo();
  const vinylsRepo = makeMockVinylsRepo();
  const service = buildService(reviewRepo, vinylsRepo);

  await service.deleteReview('review-1');

  assert.strictEqual(vinylsRepo.updateVinylStats.mock.calls.length, 1);
  assert.strictEqual(
    vinylsRepo.updateVinylStats.mock.calls[0].arguments[0],
    'vinyl-1',
  );
});

void test('getReviewsOfVinyl: page=1 limit=2 returns first 2 reviews', async () => {
  const reviewRepo = makeMockReviewRepo();
  const vinylsRepo = makeMockVinylsRepo();
  reviewRepo.getReviewsOfVinyl = mock.fn((_vid: string) =>
    Promise.resolve(threeReviews),
  );
  const service = buildService(reviewRepo, vinylsRepo);

  const result = await service.getReviewsOfVinyl('vinyl-1', {
    page: 1,
    limit: 2,
  });

  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].comment, 'Review 1');
  assert.strictEqual(result[0].authorName, 'Alice');
  assert.strictEqual(result[0].reviewScore, 5);
  assert.strictEqual(result[1].comment, 'Review 2');
});

void test('getReviewsOfVinyl: page=2 limit=2 returns last review', async () => {
  const reviewRepo = makeMockReviewRepo();
  const vinylsRepo = makeMockVinylsRepo();
  reviewRepo.getReviewsOfVinyl = mock.fn((_vid: string) =>
    Promise.resolve(threeReviews),
  );
  const service = buildService(reviewRepo, vinylsRepo);

  const result = await service.getReviewsOfVinyl('vinyl-1', {
    page: 2,
    limit: 2,
  });

  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].comment, 'Review 3');
  assert.strictEqual(result[0].authorName, 'Carol');
  assert.strictEqual(result[0].reviewScore, 3);
});

void test('getReviewsOfVinyl: empty list returns []', async () => {
  const reviewRepo = makeMockReviewRepo();
  const vinylsRepo = makeMockVinylsRepo();
  reviewRepo.getReviewsOfVinyl = mock.fn((_vid: string) =>
    Promise.resolve([] as ReviewRow[]),
  );
  const service = buildService(reviewRepo, vinylsRepo);

  const result = await service.getReviewsOfVinyl('vinyl-1');

  assert.strictEqual(result.length, 0);
});

void test('getReviewsOfVinyl: reviewScore is always a number', async () => {
  const reviewRepo = makeMockReviewRepo();
  const vinylsRepo = makeMockVinylsRepo();
  reviewRepo.getReviewsOfVinyl = mock.fn((_vid: string) =>
    Promise.resolve([
      {
        comment: 'Good',
        reviewScore: '4' as unknown as number,
        user: { name: 'Dave' },
      },
    ]),
  );
  const service = buildService(reviewRepo, vinylsRepo);

  const result = await service.getReviewsOfVinyl('vinyl-1');

  assert.strictEqual(typeof result[0].reviewScore, 'number');
  assert.strictEqual(result[0].reviewScore, 4);
});
