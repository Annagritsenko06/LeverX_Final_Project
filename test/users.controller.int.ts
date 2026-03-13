import {test, mock} from 'node:test';
import assert from 'node:assert/strict';

import { Test } from '@nestjs/testing'
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserController } from '../dist/users/users.controller.js';
import { UserService } from '../dist/users/users.service.js';
import { NotificationService } from '../dist/notifications/notifications.service.js';
import { AuthGuard } from '../dist/auth/auth.service.js';
import { EventEmitter2 } from '@nestjs/event-emitter';

import type {  ExecutionContext } from '@nestjs/common';

let app: INestApplication;

const mockGuard = mock.fn((context: ExecutionContext) => {
  context.switchToHttp().getRequest().user = { email: 'anna@mail.ru' };
  return true;
});
const userServiceMock = {
  registerUser: async (data: any) => ({
    name: data.name,
  }),

  loginUser: async (email: string, password: string) => ({
    token: 'test-token',
    userEmail: email,
  }),

  updateUserProfile: async (email: string, name: string, lastname: string) => ({
    name,
    lastname,
  }),

  getUsersWithFirstPostAndLikes: async () => [
    {
      name: 'Anna',
      email: 'anna@mail.ru',
    },
  ],
};

const notificationMock = {};

const eventEmitterMock = {
  emit: () => {},
};



test.before(async () => {
  const moduleRef = await Test.createTestingModule({
    controllers: [UserController],
    providers: [
      { provide: UserService, useValue: userServiceMock },
      { provide: NotificationService, useValue: notificationMock },
      { provide: EventEmitter2, useValue: eventEmitterMock },
    ],
  })
  .overrideGuard(AuthGuard)
.useValue({
  canActivate: mockGuard
}).compile();

  app = moduleRef.createNestApplication();
  await app.init();
});

test.after(async () => {
  await app.close();
});

test('POST /users should register user', async () => {
  const res = await request(app.getHttpServer())
    .post('/users')
    .send({
      name: 'Anna',
      email: 'anna@mail.ru',
      password: '123456',
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.userName, 'Anna');
});


test('POST /users/login should login user', async () => {
  const res = await request(app.getHttpServer())
    .post('/users/login')
    .send({
      email: 'anna@mail.ru',
      password: '123456',
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.token, 'test-token');
});

test('PUT /users/profile should update profile', async () => {
  const res = await request(app.getHttpServer())
    .put('/users/profile')
    .send({
      name: 'Anna',
      lastname: 'Critsenko',
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.NewuserName, 'Anna');
});


test('PUT /users/profile should return 400 if lastname missing', async () => {
  const res = await request(app.getHttpServer())
    .put('/users/profile')
    .send({
      name: 'Anna',
    });

  assert.equal(res.status, 400);
});


test('GET /users should return users list', async () => {
  const res = await request(app.getHttpServer()).get('/users');

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.length, 1);
});