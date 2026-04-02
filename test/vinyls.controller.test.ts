import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { VinylsController } from '../src/vinyls/vinyls.controller';
import type { VinylsService } from '../src/vinyls/vinyls.service';
import { createRequest } from 'node-mocks-http';

type MockVinylsService = {
  getVinyls: ReturnType<typeof mock.fn>;
  filterVinyls: ReturnType<typeof mock.fn>;
  createVinyl: ReturnType<typeof mock.fn>;
  updateVinyl: ReturnType<typeof mock.fn>;
  deleteVinyl: ReturnType<typeof mock.fn>;
  searchVinyls: ReturnType<typeof mock.fn>;
};

function makeMockVinylsService(): MockVinylsService {
  return {
    getVinyls: mock.fn((_opts: object) =>
      Promise.resolve([
        {
          name: 'Abbey Road',
          description: 'Classic',
          price: 25,
          authorName: 'The Beatles',
          image: 'img.jpg',
        },
      ]),
    ),
    filterVinyls: mock.fn((_opts: object) =>
      Promise.resolve([
        {
          name: 'Dark Side',
          description: 'Epic',
          price: 30,
          authorName: 'Pink Floyd',
          image: 'img2.jpg',
        },
      ]),
    ),
    createVinyl: mock.fn((_data: object) =>
      Promise.resolve({
        name: 'New Vinyl',
        description: 'Fresh',
        price: 20,
        authorName: 'Artist',
      }),
    ),
    updateVinyl: mock.fn((_id: string, _data: object) =>
      Promise.resolve({
        name: 'Updated Vinyl',
        description: 'Updated desc',
        price: 35,
        authorName: 'Artist',
        image: 'img3.jpg',
      }),
    ),
    deleteVinyl: mock.fn((_id: string) => Promise.resolve(true)),
    searchVinyls: mock.fn((_name?: string, _author?: string) =>
      Promise.resolve([{ name: 'Dark Side', price: 25 }]),
    ),
  };
}

function buildController(service: MockVinylsService): VinylsController {
  return new VinylsController(service as unknown as VinylsService);
}

void test('getVinyls: returns { success: true, vinyls }', async () => {
  const service = makeMockVinylsService();
  const controller = buildController(service);

  const result = await controller.getVinyls();

  assert.strictEqual(result.success, true);
  assert.ok(Array.isArray(result.vinyls));
  assert.strictEqual(result.vinyls[0].name, 'Abbey Road');
  assert.strictEqual(service.getVinyls.mock.calls.length, 1);
});

void test('getVinyls: passes page and limit to service', async () => {
  const service = makeMockVinylsService();
  const controller = buildController(service);

  await controller.getVinyls(2, 5);

  const args = service.getVinyls.mock.calls[0].arguments[0] as {
    page: number;
    limit: number;
  };
  assert.strictEqual(args.page, 2);
  assert.strictEqual(args.limit, 5);
});

void test('filterVinyls: returns { success: true, vinyls }', async () => {
  const service = makeMockVinylsService();
  const controller = buildController(service);

  const result = await controller.filterVinyls(1, 10, 'price', 'ASC');

  assert.strictEqual(result.success, true);
  assert.ok(Array.isArray(result.vinyls));
  assert.strictEqual(result.vinyls[0].name, 'Dark Side');
});

void test('filterVinyls: passes all options to service', async () => {
  const service = makeMockVinylsService();
  const controller = buildController(service);

  await controller.filterVinyls(2, 5, 'name', 'DESC');

  const args = service.filterVinyls.mock.calls[0].arguments[0] as {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
  };
  assert.strictEqual(args.page, 2);
  assert.strictEqual(args.limit, 5);
  assert.strictEqual(args.sortBy, 'name');
  assert.strictEqual(args.sortOrder, 'DESC');
});

void test('searchVinyls: returns { success: true, vinyls }', async () => {
  const service = makeMockVinylsService();
  const controller = buildController(service);

  const result = await controller.searchVinyls('Dark Side');

  assert.strictEqual(result.success, true);
  assert.ok(Array.isArray(result.vinyls));
  assert.strictEqual(
    service.searchVinyls.mock.calls[0].arguments[0],
    'Dark Side',
  );
});

void test('searchVinyls: passes authorName to service', async () => {
  const service = makeMockVinylsService();
  const controller = buildController(service);

  await controller.searchVinyls(undefined, 'Pink Floyd');

  assert.strictEqual(
    service.searchVinyls.mock.calls[0].arguments[1],
    'Pink Floyd',
  );
});

void test('createVinyl: returns { success: true, name, price, authorName }', async () => {
  const service = makeMockVinylsService();
  const controller = buildController(service);

  const req = createRequest<Request>();
  req.user = { id: 'admin-id' };
  const body = {
    name: 'New Vinyl',
    description: 'Fresh',
    price: '20',
    authorName: 'Artist',
    image: 'img.jpg',
  } as Parameters<typeof controller.createVinyl>[1];

  const result = await controller.createVinyl(req, body);

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.name, 'New Vinyl');
  assert.strictEqual(result.price, 20);
  assert.strictEqual(result.authorName, 'Artist');
  assert.strictEqual(service.createVinyl.mock.calls.length, 1);
});

void test('updateVinyl: returns { success: true, name, price }', async () => {
  const service = makeMockVinylsService();
  const controller = buildController(service);

  const req = createRequest<Request>();
  req.user = { id: 'admin-id' };
  const body = {
    name: 'Updated Vinyl',
    description: 'Updated desc',
    price: '35',
    authorName: 'Artist',
    image: 'img3.jpg',
  } as Parameters<typeof controller.updateVinyl>[2];

  const result = await controller.updateVinyl(req, 'vinyl-1', body);

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.name, 'Updated Vinyl');
  assert.strictEqual(result.price, 35);
  assert.strictEqual(service.updateVinyl.mock.calls[0].arguments[0], 'vinyl-1');
});

void test('deleteVinyl: returns { success: true, message }', async () => {
  const service = makeMockVinylsService();
  const controller = buildController(service);

  const req = createRequest<Request>();
  req.user = { id: 'admin-id' };
  const result = await controller.deleteVinyl(req, 'vinyl-1');

  assert.strictEqual(result.success, true);
  assert.ok('message' in result);
  assert.strictEqual(service.deleteVinyl.mock.calls[0].arguments[0], 'vinyl-1');
});

void test('deleteVinyl: propagates error from service', async () => {
  const service = makeMockVinylsService();
  service.deleteVinyl = mock.fn((_id: string) =>
    Promise.reject(new Error('Vinyl not found')),
  );
  const controller = buildController(service);

  const req = createRequest<Request>();
  req.user = { id: 'admin-id' };

  await assert.rejects(() => controller.deleteVinyl(req, 'bad-id'), {
    message: 'Vinyl not found',
  });
});
