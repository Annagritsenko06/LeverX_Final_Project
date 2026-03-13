import {test, mock} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';

import { PostsController } from '../dist/posts/posts.controller.js';
import { PostsService } from '../dist/posts/posts.service.js';
import { AuthGuard } from '../dist/auth/auth.service.js';
import type {  ExecutionContext } from '@nestjs/common';

let app: INestApplication;

const mockGuard = mock.fn((context: ExecutionContext) => {
  context.switchToHttp().getRequest().user = { email: 'john@mail.com' };
  return true;
});

const postsServiceMock = {
  createPost: async (userId: string, dto: any) => ({
    title: dto.title,
    createdDate: '2025-01-01',
  }),

  getUserPosts: async () => [
    {
      id: '1',
      title: 'test post',
    },
  ],

  updatePost: async (postId: string, userId: string, dto: any) => ({
    title: dto.title,
    updatedData: '2025-01-02',
  }),

  deletePost: async () => {},

  likePost: async () => {},

  unlikePost: async () => {},
};

test.before(async () => {
  const moduleRef = await Test.createTestingModule({
    controllers: [PostsController],
    providers: [{ provide: PostsService, useValue: postsServiceMock }],
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


test('POST /posts should create post', async () => {
  const res = await request(app.getHttpServer())
    .post('/posts')
    .send({
      title: 'My post',
      content: 'content',
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.title, 'My post');
});


test('GET /posts/:userId should return posts', async () => {
  const res = await request(app.getHttpServer())
    .get('/posts/user-1')
    .query({
      page: 1,
      limit: 10,
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.posts.length, 1);
});


test('PUT /posts/:postId should update post', async () => {
  const res = await request(app.getHttpServer())
    .put('/posts/1')
    .send({
      title: 'Updated post',
      content: 'new content',
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.title, 'Updated post');
});


test('DELETE /posts/:postId should delete post', async () => {
  const res = await request(app.getHttpServer()).delete('/posts/1');

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});

test('POST /posts/:postId/like should like post', async () => {
  const res = await request(app.getHttpServer()).post('/posts/1/like');

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.message, 'Like added');
});

test('DELETE /posts/:postId/like should remove like', async () => {
  const res = await request(app.getHttpServer()).delete('/posts/1/like');

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.message, 'Like removed');
});