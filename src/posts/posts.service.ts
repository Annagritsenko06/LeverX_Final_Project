import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FileHelpers } from '../common/fileHelpers';
import { POSTSMESSAGES, MESSAGES } from '../common/messages';
import type { Post, CreatePostInput, User } from '../types/types';

@Injectable()
export class PostsService {
  constructor(private readonly fileHelpers: FileHelpers) {}

  async createPost(
    authorId: string,
    postData: CreatePostInput,
  ): Promise<{ title: string; created_date: Date }> {
    const { title, description } = postData;

    const postsFile = process.env.POSTS_FILE;
    if (!postsFile) {
      throw new Error('POSTS_FILE environment variable is not defined');
    }
    const posts = await this.fileHelpers.readFile<Post[]>(postsFile);

    const created_date = new Date();
    const postId = randomUUID();

    const newPost: Post = {
      authorId,
      postId,
      title,
      description,
      createdData: created_date,
      likes: [],
    };

    posts.push(newPost);
    await this.fileHelpers.writeFile(postsFile, posts);

    return { title, created_date };
  }

  async getUserPosts(userId: string): Promise<
    {
      title: string;
      description: string;
      created_data: Date | string;
      author: string;
    }[]
  > {
    const postsFile = process.env.POSTS_FILE;
    const dataFile = process.env.DATA_FILE;
    if (!postsFile || !dataFile) {
      throw new Error('FILE environment variable is not defined');
    }

    const posts = await this.fileHelpers.readFile<Post[]>(postsFile);
    const users = await this.fileHelpers.readFile<User[]>(dataFile);

    const userPosts = posts.filter((post) => post.authorId === userId);

    return userPosts.map((post) => {
      const author = users.find((u) => u.id === post.authorId);
      return {
        title: post.title,
        description: post.description,
        created_data: post.createdData,
        author: author
          ? `${author.name} ${author.lastname}`
          : MESSAGES.UNKNOWN_AUTHOR,
      };
    });
  }

  async updatePost(
    postId: string,
    authorId: string,
    updateData: { title: string; description: string },
  ): Promise<{ title: string; updated_date: Date }> {
    const { title, description } = updateData;

    const postsFile = process.env.POSTS_FILE;
    if (!postsFile) {
      throw new Error('POSTS_FILE environment variable is not defined');
    }
    const posts = await this.fileHelpers.readFile<Post[]>(postsFile);
    const postIndex = posts.findIndex(
      (post) => post.authorId === authorId && post.postId === postId,
    );

    if (postIndex === -1) {
      throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    const updated_date = new Date();
    posts[postIndex] = {
      ...posts[postIndex],
      title,
      description,
      updatedData: updated_date,
    };
    await this.fileHelpers.writeFile(postsFile, posts);

    return { title, updated_date };
  }

  async deletePost(postId: string, authorId: string): Promise<boolean> {
    const postsFile = process.env.POSTS_FILE;
    if (!postsFile) {
      throw new Error('POSTS_FILE environment variable is not defined');
    }
    const posts = await this.fileHelpers.readFile<Post[]>(postsFile);
    const postIndex = posts.findIndex(
      (post) => post.postId === postId && post.authorId === authorId,
    );

    if (postIndex === -1) {
      throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    posts.splice(postIndex, 1);
    await this.fileHelpers.writeFile(postsFile, posts);

    return true;
  }

  async likePost(postId: string, userId: string): Promise<void> {
    const postsFile = process.env.POSTS_FILE;
    if (!postsFile) {
      throw new Error('POSTS_FILE environment variable is not defined');
    }
    const posts = await this.fileHelpers.readFile<Post[]>(postsFile);
    const postIndex = posts.findIndex((post) => post.postId === postId);

    if (postIndex === -1) {
      throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    const likes = posts[postIndex].likes ?? [];
    if (!likes.includes(userId)) {
      likes.push(userId);
      posts[postIndex].likes = likes;
      await this.fileHelpers.writeFile(postsFile, posts);
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const postsFile = process.env.POSTS_FILE;
    if (!postsFile) {
      throw new Error('POSTS_FILE environment variable is not defined');
    }
    const posts = await this.fileHelpers.readFile<Post[]>(postsFile);
    const postIndex = posts.findIndex((post) => post.postId === postId);

    if (postIndex === -1) {
      throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    const likes = posts[postIndex].likes ?? [];
    const newLikes = likes.filter((id) => id !== userId);
    posts[postIndex].likes = newLikes;

    await this.fileHelpers.writeFile(postsFile, posts);
  }
}
