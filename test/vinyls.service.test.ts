import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { VinylsService } from '../src/vinyls/vinyls.service';
import type { VinylsRepository } from '../src/vinyls/vinyls.repository';
import type { LoggerService } from '../src/common/logger';
import type { Vinyl, CreateVinylInput } from '../src/types/types';

type VinylWithUser = Vinyl & { User?: { name: string } };

const mockLogger = {
  log: mock.fn((_msg: string, _meta?: object) => undefined),
  error: mock.fn((_msg: string) => undefined),
  warn: mock.fn((_msg: string) => undefined),
} satisfies Partial<LoggerService>;

function makeMockRepo() {
  return {
    addVinyl: mock.fn((data: CreateVinylInput) =>
      Promise.resolve<Vinyl>({
        vinylId: 'v-1',
        name: data.name,
        description: data.description,
        price: data.price,
        authorName: data.authorName,
        image: data.image,
      }),
    ),
    updateVunyl: mock.fn(
      (
        _id: string,
        _n: string,
        _d: string,
        _p: number,
        _a: string,
        _i: string,
      ) => Promise.resolve<Vinyl | null>(null),
    ),
    searchVinylByName: mock.fn((_name?: string, _author?: string) =>
      Promise.resolve<Vinyl | null>(null),
    ),
    findVinylById: mock.fn((_id: string) =>
      Promise.resolve<Vinyl | null>(null),
    ),
    deleteVinyl: mock.fn((_id: string) => Promise.resolve<number>(0)),
    getAllVinyls: mock.fn(() => Promise.resolve<VinylWithUser[]>([])),
    addPurchaseVinyl: mock.fn((_uid: string, _name: string) =>
      Promise.resolve<{ purchasedAt: Date } | null>(null),
    ),
    updateVinylStats: mock.fn((_id: string, _avg: number, _first: string) =>
      Promise.resolve<void>(undefined),
    ),
  };
}

type MockRepo = ReturnType<typeof makeMockRepo>;

function buildService(repo: MockRepo): VinylsService {
  return new VinylsService(
    repo as unknown as VinylsRepository,
    mockLogger as unknown as LoggerService,
  );
}

const makeVinyls = (): VinylWithUser[] => [
  {
    vinylId: 'v-1',
    name: 'B',
    description: '',
    price: 30,
    authorName: 'X',
    image: '',
    User: {
      name: 'X',
      id: '1',
      lastname: 'XX',
      email: 'x@example.com',
      roleId: 'user',
    },
  },
  {
    vinylId: 'v-2',
    name: 'A',
    description: '',
    price: 10,
    authorName: 'Y',
    image: '',
    User: {
      name: 'Y',
      id: '2',
      lastname: 'YY',
      email: 'Y@example.com',
      roleId: 'user',
    },
  },
  {
    vinylId: 'v-3',
    name: 'C',
    description: '',
    price: 20,
    authorName: 'Z',
    image: '',
    User: {
      name: 'Z',
      id: '3',
      lastname: 'ZZ',
      email: 'Z@example.com',
      roleId: 'user',
    },
  },
];

void test('createVinyl: happy path — returns name/description/price/authorName', async () => {
  const repo = makeMockRepo();
  repo.addVinyl = mock.fn((_data: CreateVinylInput) =>
    Promise.resolve<Vinyl>({
      vinylId: 'v-1',
      name: 'Dark Side',
      description: 'Classic album',
      price: 25,
      authorName: 'Pink Floyd',
      image: 'img.jpg',
    }),
  );
  const service = buildService(repo);

  const result = await service.createVinyl({
    name: 'Dark Side',
    description: 'Classic album',
    price: '25',
    authorName: 'Pink Floyd',
    image: 'img.jpg',
  });

  assert.strictEqual(result.name, 'Dark Side');
  assert.strictEqual(result.description, 'Classic album');
  assert.strictEqual(result.price, 25);
  assert.strictEqual(result.authorName, 'Pink Floyd');
  assert.strictEqual(repo.addVinyl.mock.calls.length, 1);
  assert.strictEqual(repo.addVinyl.mock.calls[0].arguments[0].price, 25);
});

void test('createVinyl: price=0 throws BadRequestException', async () => {
  const service = buildService(makeMockRepo());
  await assert.rejects(
    () =>
      service.createVinyl({
        name: 'X',
        description: 'Y',
        price: '0',
        authorName: 'A',
        image: '',
      }),
    { message: 'Invalid price' },
  );
});

void test('createVinyl: price=-1 throws BadRequestException', async () => {
  const service = buildService(makeMockRepo());
  await assert.rejects(
    () =>
      service.createVinyl({
        name: 'X',
        description: 'Y',
        price: '-1',
        authorName: 'A',
        image: '',
      }),
    { message: 'Invalid price' },
  );
});

void test('createVinyl: price=NaN throws BadRequestException', async () => {
  const service = buildService(makeMockRepo());
  await assert.rejects(
    () =>
      service.createVinyl({
        name: 'X',
        description: 'Y',
        price: 'abc',
        authorName: 'A',
        image: '',
      }),
    { message: 'Invalid price' },
  );
});

void test('filterVinyls: sortOrder ASC — prices sorted ascending', async () => {
  const repo = makeMockRepo();
  repo.getAllVinyls = mock.fn(() =>
    Promise.resolve<VinylWithUser[]>(makeVinyls()),
  );
  const service = buildService(repo);

  const result = await service.filterVinyls({ sortOrder: 'ASC' });

  assert.strictEqual(result[0].price, 10);
  assert.strictEqual(result[1].price, 20);
  assert.strictEqual(result[2].price, 30);
});

void test('filterVinyls: sortOrder DESC — prices sorted descending', async () => {
  const repo = makeMockRepo();
  repo.getAllVinyls = mock.fn(() =>
    Promise.resolve<VinylWithUser[]>(makeVinyls()),
  );
  const service = buildService(repo);

  const result = await service.filterVinyls({ sortOrder: 'DESC' });

  assert.strictEqual(result[0].price, 30);
  assert.strictEqual(result[1].price, 20);
  assert.strictEqual(result[2].price, 10);
});

void test('filterVinyls: pagination page=2 limit=2 returns correct slice', async () => {
  const repo = makeMockRepo();
  repo.getAllVinyls = mock.fn(() =>
    Promise.resolve<VinylWithUser[]>([
      {
        vinylId: 'v-1',
        name: 'A',
        description: '',
        price: 10,
        authorName: 'X',
        image: '',
        User: {
          name: 'X',
          id: '1',
          lastname: 'XX',
          email: 'x@example.com',
          roleId: 'user',
        },
      },
      {
        vinylId: 'v-2',
        name: 'B',
        description: '',
        price: 20,
        authorName: 'Y',
        image: '',
        User: {
          name: 'Y',
          id: '2',
          lastname: 'YY',
          email: 'Y@example.com',
          roleId: 'user',
        },
      },
      {
        vinylId: 'v-3',
        name: 'C',
        description: '',
        price: 30,
        authorName: 'Z',
        image: '',
        User: {
          name: 'Z',
          id: '3',
          lastname: 'ZZ',
          email: 'Z@example.com',
          roleId: 'user',
        },
      },
      {
        vinylId: 'v-4',
        name: 'D',
        description: '',
        price: 40,
        authorName: 'W',
        image: '',
        User: {
          name: 'W',
          id: '4',
          lastname: 'WW',
          email: 'W@example.com',
          roleId: 'user',
        },
      },
    ]),
  );
  const service = buildService(repo);

  const result = await service.filterVinyls({
    page: 2,
    limit: 2,
    sortOrder: 'ASC',
  });

  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].price, 30);
  assert.strictEqual(result[1].price, 40);
});

void test('filterVinyls: sortBy name ASC — sorted alphabetically', async () => {
  const repo = makeMockRepo();
  repo.getAllVinyls = mock.fn(() =>
    Promise.resolve<VinylWithUser[]>(makeVinyls()),
  );
  const service = buildService(repo);

  const result = await service.filterVinyls({
    sortBy: 'name',
    sortOrder: 'ASC',
  });

  assert.strictEqual(result[0].name, 'A');
  assert.strictEqual(result[1].name, 'B');
  assert.strictEqual(result[2].name, 'C');
});

void test('getVinyls: happy path with pagination page=1 limit=2', async () => {
  const repo = makeMockRepo();
  repo.getAllVinyls = mock.fn(() =>
    Promise.resolve<VinylWithUser[]>([
      {
        vinylId: 'v-1',
        name: 'A',
        description: 'desc1',
        price: 10,
        authorName: 'X',
        image: 'a.jpg',
        User: {
          name: 'Artist A',
          id: '1',
          lastname: 'ARTIST_A',
          email: 'ARTIST_A@example.com',
          roleId: 'user',
        },
      },
      {
        vinylId: 'v-2',
        name: 'B',
        description: 'desc2',
        price: 20,
        authorName: 'Y',
        image: 'b.jpg',
        User: {
          name: 'Artist B',
          id: '2',
          lastname: 'ARTIST_B',
          email: 'ARTIST_B@example.com',
          roleId: 'user',
        },
      },
      {
        vinylId: 'v-3',
        name: 'C',
        description: 'desc3',
        price: 30,
        authorName: 'Z',
        image: 'c.jpg',
        User: {
          name: 'Artist C',
          id: '3',
          lastname: 'ARTIST_C',
          email: 'ARTIST_C@example.com',
          roleId: 'user',
        },
      },
    ]),
  );
  const service = buildService(repo);

  const result = await service.getVinyls({ page: 1, limit: 2 });

  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].name, 'A');
  assert.strictEqual(result[1].name, 'B');
});

void test('getVinyls: returns empty array when no vinyls', async () => {
  const repo = makeMockRepo();
  repo.getAllVinyls = mock.fn(() => Promise.resolve<VinylWithUser[]>([]));
  const service = buildService(repo);

  const result = await service.getVinyls({ page: 1, limit: 10 });

  assert.strictEqual(result.length, 0);
});

void test('searchVinyls: happy path — returns vinyl', async () => {
  const fakeVinyl: Vinyl = {
    vinylId: 'v-1',
    name: 'Dark Side',
    description: 'Classic',
    price: 25,
    authorName: 'Pink Floyd',
    image: 'img.jpg',
  };
  const repo = makeMockRepo();
  repo.searchVinylByName = mock.fn((_name?: string, _author?: string) =>
    Promise.resolve<Vinyl | null>(fakeVinyl),
  );
  const service = buildService(repo);

  const result = await service.searchVinyls('Dark Side');

  assert.deepStrictEqual(result, fakeVinyl);
  assert.strictEqual(
    repo.searchVinylByName.mock.calls[0].arguments[0],
    'Dark Side',
  );
});

void test('searchVinyls: returns null when not found', async () => {
  const repo = makeMockRepo();
  repo.searchVinylByName = mock.fn((_name?: string, _author?: string) =>
    Promise.resolve<Vinyl | null>(null),
  );
  const service = buildService(repo);

  const result = await service.searchVinyls('Unknown');

  assert.strictEqual(result, null);
});

void test('updateVinyl: happy path — returns updated vinyl', async () => {
  const updated: Vinyl = {
    vinylId: 'v-1',
    name: 'New Name',
    description: 'New Desc',
    price: 50,
    authorName: 'New Author',
    image: 'new.jpg',
  };
  const repo = makeMockRepo();
  repo.updateVunyl = mock.fn(
    (_id: string, _n: string, _d: string, _p: number, _a: string, _i: string) =>
      Promise.resolve<Vinyl | null>(updated),
  );
  const service = buildService(repo);

  const result = await service.updateVinyl('vinyl-id', {
    name: 'New Name',
    description: 'New Desc',
    price: '50',
    authorName: 'New Author',
    image: 'new.jpg',
  });

  assert.strictEqual(result.name, 'New Name');
  assert.strictEqual(result.price, 50);
  assert.strictEqual(result.authorName, 'New Author');
});

void test('updateVinyl: vinyl not found — throws error', async () => {
  const repo = makeMockRepo();
  repo.updateVunyl = mock.fn(
    (_id: string, _n: string, _d: string, _p: number, _a: string, _i: string) =>
      Promise.resolve<Vinyl | null>(null),
  );
  const service = buildService(repo);

  await assert.rejects(
    () =>
      service.updateVinyl('wrong-id', {
        name: 'X',
        description: 'Y',
        price: '10',
        authorName: 'A',
        image: '',
      }),
    { message: 'Vinyl not found' },
  );
});

void test('deleteVinyl: happy path — returns true', async () => {
  const repo = makeMockRepo();
  repo.deleteVinyl = mock.fn((_id: string) => Promise.resolve<number>(1));
  const service = buildService(repo);

  const result = await service.deleteVinyl('vinyl-id');

  assert.strictEqual(result, true);
  assert.strictEqual(repo.deleteVinyl.mock.calls[0].arguments[0], 'vinyl-id');
});

void test('deleteVinyl: deletedCount=0 — throws error', async () => {
  const repo = makeMockRepo();
  repo.deleteVinyl = mock.fn((_id: string) => Promise.resolve<number>(0));
  const service = buildService(repo);

  await assert.rejects(() => service.deleteVinyl('wrong-id'), {
    message: 'Vinyl not found',
  });
});
