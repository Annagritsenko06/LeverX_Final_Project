import { test, beforeEach, mock, before} from 'node:test';
import { Test, TestingModule } from '@nestjs/testing';
import assert from 'node:assert/strict';
import { v4 as uuidv4 } from 'uuid';
import { POSTSMESSAGES } from '../dist/common/messages.js';
import { PostsService } from '../dist/posts/posts.service.js';
import { PostsRepository } from '../dist/posts/posts.repository.js'; 

const fakePost = {
  postId: uuidv4(),
  authorId: "user1",
  title: "Hello World",
  description: "This is a test post",
  likes: ["user2"],
  createdData: new Date(),
  updatedData: new Date()
};
export interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
}
export interface Post {
  authorId: string;
  postId: string;
  title: string;
  description: string;
  createdData: Date;
  updatedData?: Date;
  likes: string[];
  User?: User;
}

test('PostsService', async (t) => {
  let postsService: PostsService;
  let module: TestingModule;

 interface IPostRepository 
  {
  addPost(post: { authorId: string; title: string; description: string }): Promise<Post>;
  updatePost(postId: string, title: string, description: string): Promise<Post | null>;
  findPostById(authorId: string, postId: string): Promise<Post | null>;
  deletePost(postId: string): Promise<number>;
  getAllPosts(): Promise<[]>;
  addLike(postId: string, userId: string): Promise<Post>;
  deleteLike(postId: string, userId: string): Promise<Post>;
}
 
let mockPostRepository: {
  [K in keyof IPostRepository]: ReturnType<typeof mock.fn>;
};

  before(async () => {
    mockPostRepository = {
      addPost: mock.fn(async (postData: { authorId: string; title: string; description: string }) => ({
        ...fakePost,
        postId: uuidv4(),
        ...postData,
        likes: [],
        createdData: new Date(),
        updatedData: new Date(),
        toJSON() {
          return {
            postId: this.postId,
            authorId: this.authorId,
            title: this.title,
            description: this.description,
            createdData: this.createdData,
            updatedData: this.updatedData,
            likes: this.likes
          };
        }
      })),
      updatePost: mock.fn(async (postId: string, authorId: string, data: any) => {
        if (postId !== fakePost.postId) return null;
        fakePost.title = data.title;
        fakePost.description = data.description;
        fakePost.updatedData = new Date();
        return fakePost;
      }),
      findPostById: mock.fn(async (authorId: string, postId: string) => {
        if (authorId === fakePost.authorId && postId === fakePost.postId) return fakePost;
        return null;
      }),
      deletePost: mock.fn(async (postId: string) => postId === fakePost.postId ? 1 : 0),
      getAllPosts: mock.fn(async () => []),
      addLike: mock.fn(async (postId: string, userId: string) => {
        if (postId !== fakePost.postId) throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
        if (!fakePost.likes.includes(userId)) fakePost.likes.push(userId);
        return fakePost;
      }),
      deleteLike: mock.fn(async (postId: string, userId: string) => {
        if (postId !== fakePost.postId) throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
        fakePost.likes = fakePost.likes.filter(id => id !== userId);
        return fakePost;
      })
    };

    module = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PostsRepository, useValue: mockPostRepository },
      ]
    }).compile();

    postsService = module.get<PostsService>(PostsService);
  });


  await t.test('should create post successfully', async () => {
    const result = await postsService.createPost("user1", { title: "My post", description: "desc" });
    assert.ok({title: result.title, createdDate:result.createdDate});
    assert.strictEqual(result.title, "My post");
    assert.strictEqual(mockPostRepository.addPost.mock.calls.length, 1);
  });

  await t.test('should get user posts formatted', async () => {
    const posts = [{ title: "Post A", description: "desc", createdData: new Date(), User: { name: "Anna", lastname: "Smith" } }];
    mockPostRepository.getAllPosts.mock.mockImplementation(async () => posts);

    const result = await postsService.getUserPosts("user1");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].author, "Anna Smith");
  });

  await t.test('should filter posts by title', async () => {
    const posts = [
      { title: "Hello", description: "", createdData: new Date() },
      { title: "World", description: "", createdData: new Date() }
    ];
    mockPostRepository.getAllPosts.mock.mockImplementation(async () => posts);

    const result = await postsService.getUserPosts("user1", { title: "hell" });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].title, "Hello");
  });

  await t.test('should update post', async () => {
    const updated = { title: "New title", description: "desc", updatedData: new Date() };
     mockPostRepository.updatePost.mock.mockImplementation(async () =>updated);

    const result = await postsService.updatePost(fakePost.postId, "user1", { title: "New title", description: "desc" });
    assert.strictEqual(result.title, "New title");
  });

  await t.test('should throw if updating non-existent post', async () => {
    mockPostRepository.updatePost.mock.mockImplementation(async () =>null);
    await assert.rejects(
      () => postsService.updatePost("wrongId", "user1", { title: "t", description: "d" }),
      { message: "Post not found" }
    );
  });

  await t.test('should delete post successfully', async () => {
    mockPostRepository.deletePost.mock.mockImplementation(async () =>1);
    const result = await postsService.deletePost(fakePost.postId, "user1");
    assert.strictEqual(result, true);
  });

  await t.test('should throw if deleting non-existent post', async () => {
    mockPostRepository.deletePost.mock.mockImplementation(async () =>0);
    await assert.rejects(
      () => postsService.deletePost("wrongId", "user1"),
      { message: "Post not found" }
    );
  });

  await t.test('should like post', async () => {
    await postsService.likePost(fakePost.postId, "user3");
    assert.strictEqual(mockPostRepository.addLike.mock.calls.length, 1);
  });

  await t.test('should unlike post', async () => {
    await postsService.unlikePost(fakePost.postId, "user2");
    assert.strictEqual(mockPostRepository.deleteLike.mock.calls.length, 1);
  });

  await t.test('should paginate and sort posts correctly', async () => {
    const posts = Array.from({ length: 15 }, (_, i) => ({ title: `Post${i}`, description: "desc", createdData: new Date(), User: { name: "A", lastname: "B" } }));
    mockPostRepository.getAllPosts.mock.mockImplementation(async () =>posts);

    const page1 = await postsService.getUserPosts("user1", { page: 1, limit: 5 });
    assert.strictEqual(page1.length, 5);
    assert.strictEqual(page1[0].title, "Post0");

    const page3 = await postsService.getUserPosts("user1", { page: 3, limit: 5 });
    assert.strictEqual(page3.length, 5);
    assert.strictEqual(page3[0].title, "Post10");
  });
  await t.test('getUserPosts should sort by createdData DESC by default', async () => {
  const posts = [
    { title: "Post1", description: "desc", createdData: new Date('2026-03-10'), User: { name: "A", lastname: "B" } },
    { title: "Post2", description: "desc", createdData: new Date('2026-03-11'), User: { name: "C", lastname: "D" } },
  ];
   mockPostRepository.getAllPosts.mock.mockImplementation(async () =>posts);

  const result = await postsService.getUserPosts("user1");
  assert.strictEqual(result[0].title, "Post2"); 
  assert.strictEqual(result[1].title, "Post1");
});

await t.test('getUserPosts should sort by createdData ASC', async () => {
  const posts = [
    { title: "Post1", description: "desc", createdData: new Date('2026-03-10'), User: { name: "A", lastname: "B" } },
    { title: "Post2", description: "desc", createdData: new Date('2026-03-11'), User: { name: "C", lastname: "D" } },
  ];
  mockPostRepository.getAllPosts.mock.mockImplementation(async () =>posts);

  const result = await postsService.getUserPosts("user1", { sortBy: "createdData", sortOrder: "ASC" });
  assert.strictEqual(result[0].title, "Post1"); 
  assert.strictEqual(result[1].title, "Post2");
});

await t.test('getUserPosts should sort by title ASC', async () => {
  const posts = [
    { title: "B Post", description: "desc", createdData: new Date(), User: { name: "A", lastname: "B" } },
    { title: "A Post", description: "desc", createdData: new Date(), User: { name: "C", lastname: "D" } },
  ];
  mockPostRepository.getAllPosts.mock.mockImplementation(async () =>posts);

  const result = await postsService.getUserPosts("user1", { sortBy: "title", sortOrder: "ASC" });
  assert.strictEqual(result[0].title, "A Post");
  assert.strictEqual(result[1].title, "B Post");
});

await t.test('getUserPosts should sort by title DESC', async () => {
  const posts = [
    { title: "A Post", description: "desc", createdData: new Date(), User: { name: "A", lastname: "B" } },
    { title: "B Post", description: "desc", createdData: new Date(), User: { name: "C", lastname: "D" } },
  ];
  mockPostRepository.getAllPosts.mock.mockImplementation(async () =>posts);

  const result = await postsService.getUserPosts("user1", { sortBy: "title", sortOrder: "DESC" });
  assert.strictEqual(result[0].title, "B Post");
  assert.strictEqual(result[1].title, "A Post");
});

});
