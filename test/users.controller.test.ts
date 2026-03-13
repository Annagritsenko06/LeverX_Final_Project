import {test, mock} from 'node:test';
import assert from 'node:assert/strict';

import { Test, TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../dist/app.module.js'; 

const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIwOGJhMjUyLWIyNDktNDFiMi04ZTdiLWNlNmE3MDRkZjg4YyIsIm5hbWUiOiJzdHJpbmciLCJsYXN0bmFtZSI6InN0cmluZyIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTc3MzM5MjY2MSwiZXhwIjoxNzczNDc5MDYxfQ.x7Ss496rmlbOVHLSdKJ2UqAV001oDFod0cG9q2wguXA';
 let app: INestApplication;


test.before(async () => {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule], 
  }) 
  .compile();

  app = moduleRef.createNestApplication();
  await app.init();
});

test.after(async () => {
  if (app) {
    await app.close();
  }
});

test.skip('POST /users should register user', async () => {
  const res = await request(app.getHttpServer())
    .post('/users')
    .send({
      name: 'Anna',
      lastname: '****',
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
});

test('PUT /users/profile should update profile', async () => {
  const res = await request(app.getHttpServer())
      .put('/users/profile')
    .set('Authorization', token)
    .send({
      name: 'Anna',
      lastname: 'Gritsenko',
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.NewuserName, 'Anna');
});


test('PUT /users/profile should return 400 if lastname missing', async () => {
  const res = await request(app.getHttpServer())
    .put('/users/profile')
    .set('Authorization', token)
    .send({
      name: 'Anna',
    });

  assert.equal(res.status, 400);
});


test('GET /users should return users list', async () => {
  const res = await request(app.getHttpServer()).get('/users').set('Authorization', token);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});