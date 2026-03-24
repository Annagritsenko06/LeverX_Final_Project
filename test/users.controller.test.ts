import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { UserController } from '../src/users/users.controller';
import type { UserService } from '../src/users/users.service';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { AuthRequest } from '../src/types/types';
import type { RegisterAdminDto } from '../src/users/dto/register-admin.dto';
import type { UpdateProfileDto } from '../src/users/dto/update-profile.dto';

type MockUserService = {
  registerUser: ReturnType<typeof mock.fn>;
  loginGoogleUser: ReturnType<typeof mock.fn>;
  logout: ReturnType<typeof mock.fn>;
  updateUserProfile: ReturnType<typeof mock.fn>;
  showProfile: ReturnType<typeof mock.fn>;
  deleteProfile: ReturnType<typeof mock.fn>;
  validateGoogleUser: ReturnType<typeof mock.fn>;
};

type MockEmitter = { emit: ReturnType<typeof mock.fn> };

function makeMockUserService(): MockUserService {
  return {
    registerUser: mock.fn((_data: object) =>
      Promise.resolve({ userId: 'new-id', name: 'Anna' }),
    ),
    loginGoogleUser: mock.fn((_email: string) =>
      Promise.resolve({ token: 'tok', userEmail: 'anna@mail.ru' }),
    ),
    logout: mock.fn((_id: string) =>
      Promise.resolve({ message: 'Logged out' }),
    ),
    updateUserProfile: mock.fn(
      (_e: string, _n: string, _l: string, _b: Date, _a: string) =>
        Promise.resolve({ name: 'Anna', lastname: 'Gritsenko' }),
    ),
    showProfile: mock.fn((_email: string) =>
      Promise.resolve({ id: 'user-id', name: 'Anna', email: 'anna@mail.ru' }),
    ),
    deleteProfile: mock.fn((_email: string) => Promise.resolve(true)),
    validateGoogleUser: mock.fn((_data: object) => Promise.resolve({})),
  };
}

function makeMockEventEmitter(): MockEmitter {
  return { emit: mock.fn((_event: string, ..._args: unknown[]) => true) };
}

function buildController(
  service: MockUserService,
  emitter: MockEmitter,
): UserController {
  return new UserController(
    service as unknown as UserService,
    emitter as unknown as EventEmitter2,
  );
}

const makeAuthReq = (id: string, email: string): AuthRequest =>
  ({ user: { id, email } }) as unknown as AuthRequest;

void test('registerAdmin: returns { success: true, userName }', async () => {
  const service = makeMockUserService();
  const emitter = makeMockEventEmitter();
  const controller = buildController(service, emitter);

  const dto: RegisterAdminDto = {
    name: 'Anna',
    lastname: 'Gritsenko',
    email: 'anna@mail.ru',
    roleId: 'admin',
  };

  const result = await controller.registerAdmin(dto);

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.userName, 'Anna');
  assert.strictEqual(service.registerUser.mock.calls.length, 1);
  const arg = service.registerUser.mock.calls[0].arguments[0] as {
    email: string;
  };
  assert.strictEqual(arg.email, 'anna@mail.ru');
});

void test('logout: returns { message: "Logged out successfully" }', async () => {
  const service = makeMockUserService();
  const emitter = makeMockEventEmitter();
  const controller = buildController(service, emitter);

  const result = await controller.logout(
    makeAuthReq('user-id', 'anna@mail.ru'),
  );

  assert.strictEqual(result.message, 'Logged out successfully');
  assert.strictEqual(service.logout.mock.calls.length, 1);
  assert.strictEqual(service.logout.mock.calls[0].arguments[0], 'user-id');
});

void test('updateProfile: returns { success: true, NewuserName, NewLastname }', async () => {
  const service = makeMockUserService();
  const emitter = makeMockEventEmitter();
  const controller = buildController(service, emitter);

  const body: UpdateProfileDto = {
    name: 'Anna',
    lastname: 'Gritsenko',
    avatar: 'avatar.png',
    birthdate: '1990-01-01',
  };

  const result = await controller.updateProfile(
    makeAuthReq('user-id', 'anna@mail.ru'),
    body,
  );

  assert.strictEqual(result?.success, true);
  assert.strictEqual(result.NewuserName, 'Anna');
  assert.strictEqual(result.NewLastname, 'Gritsenko');
  assert.strictEqual(service.updateUserProfile.mock.calls.length, 1);
});

void test('updateProfile: passes correct args to service', async () => {
  const service = makeMockUserService();
  const emitter = makeMockEventEmitter();
  const controller = buildController(service, emitter);

  const body: UpdateProfileDto = {
    name: 'Anna',
    lastname: 'Gritsenko',
    avatar: 'avatar.png',
    birthdate: '1990-01-01',
  };

  await controller.updateProfile(makeAuthReq('user-id', 'anna@mail.ru'), body);

  const args = service.updateUserProfile.mock.calls[0].arguments as [
    string,
    string,
    string,
    Date,
    string,
  ];
  assert.strictEqual(args[0], 'anna@mail.ru');
  assert.strictEqual(args[1], 'Anna');
  assert.strictEqual(args[2], 'Gritsenko');
  assert.ok(args[3] instanceof Date);
  assert.strictEqual(args[4], 'avatar.png');
});

void test('updateProfile: emits profileUpdated event', async () => {
  const service = makeMockUserService();
  const emitter = makeMockEventEmitter();
  const controller = buildController(service, emitter);

  const body: UpdateProfileDto = {
    name: 'Anna',
    lastname: 'Gritsenko',
    avatar: 'avatar.png',
    birthdate: '1990-01-01',
  };

  await controller.updateProfile(makeAuthReq('user-id', 'anna@mail.ru'), body);

  assert.strictEqual(emitter.emit.mock.calls.length, 1);
  assert.strictEqual(emitter.emit.mock.calls[0].arguments[0], 'profileUpdated');
});

void test('updateProfile: throws BadRequestException if lastname missing', async () => {
  const service = makeMockUserService();
  const emitter = makeMockEventEmitter();
  const controller = buildController(service, emitter);

  const body = {
    name: 'Anna',
    avatar: 'avatar.png',
    birthdate: '1990-01-01',
  } as UpdateProfileDto;

  await assert.rejects(
    () =>
      controller.updateProfile(makeAuthReq('user-id', 'anna@mail.ru'), body),
    { message: 'All parametrs are required' },
  );
});

void test('updateProfile: throws BadRequestException if avatar missing', async () => {
  const service = makeMockUserService();
  const emitter = makeMockEventEmitter();
  const controller = buildController(service, emitter);

  const body = {
    name: 'Anna',
    lastname: 'Gritsenko',
    birthdate: '1990-01-01',
  } as UpdateProfileDto;

  await assert.rejects(
    () =>
      controller.updateProfile(makeAuthReq('user-id', 'anna@mail.ru'), body),
    { message: 'All parametrs are required' },
  );
});

void test('showProfile: returns { success: true, profile }', async () => {
  const service = makeMockUserService();
  const emitter = makeMockEventEmitter();
  const controller = buildController(service, emitter);

  const result = await controller.showProfile(
    makeAuthReq('user-id', 'anna@mail.ru'),
  );

  assert.strictEqual(result.success, true);
  assert.ok(result.profile);
  assert.strictEqual(
    service.showProfile.mock.calls[0].arguments[0],
    'anna@mail.ru',
  );
});

void test('deleteProfile: returns { success: true, message }', async () => {
  const service = makeMockUserService();
  const emitter = makeMockEventEmitter();
  const controller = buildController(service, emitter);

  const result = await controller.deleteProfile(
    makeAuthReq('user-id', 'anna@mail.ru'),
  );

  assert.strictEqual(result.success, true);
  assert.ok(result.message);
  assert.strictEqual(
    service.deleteProfile.mock.calls[0].arguments[0],
    'anna@mail.ru',
  );
});

void test('googleCallback: returns { success: true, token, userEmail }', async () => {
  const service = makeMockUserService();
  const emitter = makeMockEventEmitter();
  const controller = buildController(service, emitter);

  const req = { user: { email: 'anna@mail.ru' } } as unknown as AuthRequest;
  const result = await controller.googleCallback(req);

  assert.strictEqual(result.success, true);
  assert.ok(result.token);
  assert.strictEqual(result.userEmail, 'anna@mail.ru');
  assert.strictEqual(
    service.loginGoogleUser.mock.calls[0].arguments[0],
    'anna@mail.ru',
  );
});
