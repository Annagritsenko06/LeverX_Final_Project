import {test, mock} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
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


test('POST /posts should create post', async () => {
  const res = await request(app.getHttpServer())
    .post('/posts')
    .set('Authorization', token) .send({
      title: 'My post',
      description: 'content',
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.title, 'My post');
});


test('GET /posts/:userId should return posts', async () => {
  const res = await request(app.getHttpServer())
    .get('/posts/052c4e33-2696-4aa8-a8df-e9da4e83b29d')
     .set('Authorization',token).query({
      page: 1,
      limit: 10,
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});


test('PUT /posts/:postId should update post', async () => {
  const res = await request(app.getHttpServer())
    .put('/posts/d5c41f3c-bd7c-48dc-bedb-f21b21242e15')
     .set('Authorization', token).send({
      title: 'Updated post',
      content: 'new content',
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.title, 'Updated post');
});


test('POST /posts/:postId/like should like post', async () => {
  const res = await request(app.getHttpServer()).post('/posts/d5c41f3c-bd7c-48dc-bedb-f21b21242e15/like').set('Authorization',token)
   ;

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.message, 'Like added');
});

test('DELETE /posts/:postId/like should remove like', async () => {
  const res = await request(app.getHttpServer()).delete('/posts/d5c41f3c-bd7c-48dc-bedb-f21b21242e15/like').set('Authorization', token);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.message, 'Like removed');
});

test.skip('DELETE /posts/:postId should delete post', async () => {
  const res = await request(app.getHttpServer()).delete('/posts/e44381fb-92b7-4563-9dcc-4db974d0697f').set('Authorization',token);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});