import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { UserService } from '../src/users/users.service';
import type { UsersRepository } from '../src/users/users.repository';
import type { LoggerService } from '../src/common/logger';
import type { ConfigService } from '@nestjs/config';
import type { User, RegisterUserInput } from '../src/types/types';

type MockUser = User & { sessionVersion: number };

const mockLogger = {
  log: mock.fn((_msg: string, _meta?: object) => undefined),
  error: mock.fn((_msg: string) => undefined),
  warn: mock.fn((_msg: string) => undefined),
} satisfies Partial<LoggerService>;

const mockConfigService = {
  get: mock.fn((key: string): string | undefined => {
    if (key === 'JWT_SECRET') return 'test-secret';
    if (key === 'JWT_EXPIRES_IN') return '1d';
    return undefined;
  }),
} satisfies Partial<ConfigService>;

const userData: RegisterUserInput = {
  name: 'Anna',
  lastname: 'Gritsenko',
  email: 'anna@test.com',
  roleId: 'user',
};

const existingUser: MockUser = {
  id: 'user-id',
  name: 'Anna',
  lastname: 'Gritsenko',
  email: 'anna@test.com',
  roleId: 'user',
  googleSub: '',
  sessionVersion: 0,
};

function makeMockRepo() {
  return {
    findUserByEmail: mock.fn((_email: string) =>
      Promise.resolve<MockUser | null>(null),
    ),
    addUser: mock.fn((data: RegisterUserInput) =>
      Promise.resolve<MockUser>({
        id: 'new-id',
        name: data.name,
        lastname: data.lastname ?? '',
        email: data.email,
        roleId: data.roleId ?? 'user',
        googleSub: '',
        sessionVersion: 0,
      }),
    ),
    updateUser: mock.fn(
      (_n: string, _l: string, _e: string, _b: Date, _a: string) =>
        Promise.resolve<boolean>(true),
    ),
    findUserByGoogleSub: mock.fn((_sub: string) =>
      Promise.resolve<MockUser | null>(null),
    ),
    updateUserByGoogleSub: mock.fn((_sub: string, _data: Partial<User>) =>
      Promise.resolve<MockUser | null>(null),
    ),
    updateUserByEmail: mock.fn((_email: string, _data: Partial<User>) =>
      Promise.resolve<MockUser | null>(null),
    ),
    updateUserGoogleSub: mock.fn((_id: string, _sub: string) =>
      Promise.resolve<MockUser | null>(null),
    ),
    deleteUser: mock.fn((_email: string) => Promise.resolve<number>(1)),
    updateSessionVersion: mock.fn((_id: string, _v: number) =>
      Promise.resolve<boolean>(true),
    ),
    findUserProfileByEmail: mock.fn((_email: string) =>
      Promise.resolve<{ toJSON: () => MockUser } | null>(null),
    ),
  };
}

type MockRepo = ReturnType<typeof makeMockRepo>;

function buildService(repo: MockRepo): UserService {
  return new UserService(
    repo as unknown as UsersRepository,
    mockLogger as unknown as LoggerService,
    mockConfigService as unknown as ConfigService,
  );
}

void test('registerUser: happy path — creates new user', async () => {
  const repo = makeMockRepo();
  const service = buildService(repo);

  const result = await service.registerUser(userData);

  assert.strictEqual(result.userId, 'new-id');
  assert.strictEqual(result.name, 'Anna');
  assert.strictEqual(repo.findUserByEmail.mock.calls.length, 1);
  assert.strictEqual(
    repo.findUserByEmail.mock.calls[0].arguments[0],
    userData.email,
  );
  assert.strictEqual(repo.addUser.mock.calls.length, 1);
  assert.strictEqual(
    repo.addUser.mock.calls[0].arguments[0].email,
    userData.email,
  );
});

void test('registerUser: throws if user already exists', async () => {
  const repo = makeMockRepo();
  repo.findUserByEmail = mock.fn((_email: string) =>
    Promise.resolve<MockUser | null>(existingUser),
  );
  const service = buildService(repo);

  await assert.rejects(() => service.registerUser(userData), {
    message: 'User already exists',
  });
  assert.strictEqual(repo.addUser.mock.calls.length, 0);
});

void test('generateToken: returns token and userEmail for existing user', async () => {
  const repo = makeMockRepo();
  repo.findUserByEmail = mock.fn((_email: string) =>
    Promise.resolve<MockUser | null>(existingUser),
  );
  const service = buildService(repo);

  const result = await service.generateToken(userData.email);

  assert.ok(result.token);
  assert.strictEqual(typeof result.token, 'string');
  assert.strictEqual(result.userEmail, userData.email);
  assert.strictEqual(repo.updateSessionVersion.mock.calls.length, 1);
  assert.strictEqual(
    repo.updateSessionVersion.mock.calls[0].arguments[0],
    'user-id',
  );
});

void test('generateToken: throws if user not found', async () => {
  const repo = makeMockRepo();
  repo.findUserByEmail = mock.fn((_email: string) =>
    Promise.resolve<MockUser | null>(null),
  );
  const service = buildService(repo);

  await assert.rejects(() => service.generateToken('unknown@test.com'), {
    message: 'User not found',
  });
  assert.strictEqual(repo.updateSessionVersion.mock.calls.length, 0);
});

void test('generateToken: increments sessionVersion by 1', async () => {
  const repo = makeMockRepo();
  repo.findUserByEmail = mock.fn((_email: string) =>
    Promise.resolve<MockUser | null>({ ...existingUser, sessionVersion: 5 }),
  );
  const service = buildService(repo);

  await service.generateToken(userData.email);

  const newVersion = repo.updateSessionVersion.mock.calls[0].arguments[1];
  assert.strictEqual(newVersion, 6);
});

void test('logout: updates session version and returns message', async () => {
  const repo = makeMockRepo();
  const service = buildService(repo);

  const result = await service.logout('user-id');

  assert.strictEqual(result.message, 'Logged out');
  assert.strictEqual(repo.updateSessionVersion.mock.calls.length, 1);
  assert.strictEqual(
    repo.updateSessionVersion.mock.calls[0].arguments[0],
    'user-id',
  );
});

void test('logout: new sessionVersion is a number', async () => {
  const repo = makeMockRepo();
  const service = buildService(repo);

  await service.logout('user-id');

  const version = repo.updateSessionVersion.mock.calls[0].arguments[1];
  assert.strictEqual(typeof version, 'number');
});

void test('updateUserProfile: returns updated name and lastname', async () => {
  const repo = makeMockRepo();
  repo.updateUser = mock.fn(
    (_n: string, _l: string, _e: string, _b: Date, _a: string) =>
      Promise.resolve<boolean>(true),
  );
  const service = buildService(repo);

  const result = await service.updateUserProfile(
    userData.email,
    'NewName',
    'NewLastname',
    new Date('1990-01-01'),
    'avatar.png',
  );

  assert.strictEqual(result.name, 'NewName');
  assert.strictEqual(result.lastname, 'NewLastname');
  assert.strictEqual(repo.updateUser.mock.calls.length, 1);
  assert.strictEqual(repo.updateUser.mock.calls[0].arguments[0], 'NewName');
  assert.strictEqual(
    repo.updateUser.mock.calls[0].arguments[2],
    userData.email,
  );
});

void test('updateUserProfile: throws if updateUser returns false', async () => {
  const repo = makeMockRepo();
  repo.updateUser = mock.fn(
    (_n: string, _l: string, _e: string, _b: Date, _a: string) =>
      Promise.resolve<boolean>(false),
  );
  const service = buildService(repo);

  await assert.rejects(
    () => service.updateUserProfile(userData.email, 'X', 'Y', new Date(), ''),
    { message: 'User not found' },
  );
});

void test('showProfile: returns user profile as JSON', async () => {
  const repo = makeMockRepo();
  repo.findUserProfileByEmail = mock.fn((_email: string) =>
    Promise.resolve<{ toJSON: () => MockUser } | null>({
      toJSON: () => existingUser,
    }),
  );
  const service = buildService(repo);

  const result = await service.showProfile(userData.email);

  assert.deepStrictEqual(result, existingUser);
  assert.strictEqual(
    repo.findUserProfileByEmail.mock.calls[0].arguments[0],
    userData.email,
  );
});

void test('showProfile: returns null if user not found', async () => {
  const repo = makeMockRepo();
  repo.findUserProfileByEmail = mock.fn((_email: string) =>
    Promise.resolve<{ toJSON: () => MockUser } | null>(null),
  );
  const service = buildService(repo);

  const result = await service.showProfile('nobody@test.com');

  assert.strictEqual(result, null);
});

void test('deleteProfile: returns true on success', async () => {
  const repo = makeMockRepo();
  repo.deleteUser = mock.fn((_email: string) => Promise.resolve<number>(1));
  const service = buildService(repo);

  const result = await service.deleteProfile(userData.email);

  assert.strictEqual(result, true);
  assert.strictEqual(
    repo.deleteUser.mock.calls[0].arguments[0],
    userData.email,
  );
});

void test('deleteProfile: throws if deleteUser returns -1', async () => {
  const repo = makeMockRepo();
  repo.deleteUser = mock.fn((_email: string) => Promise.resolve<number>(-1));
  const service = buildService(repo);

  await assert.rejects(() => service.deleteProfile('ghost@test.com'), {
    message: 'User not found',
  });
});
