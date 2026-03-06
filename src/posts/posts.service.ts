import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { POSTSMESSAGES, MESSAGES } from '../common/messages';
import type { Post, CreatePostInput, User, UserPostDto } from '../types/types';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async createPost(
    authorId: string,
    postData: CreatePostInput,
  ): Promise<{ title: string; createdDate: Date }> {
    const { title, description } = postData;

    const posts = await this.postsRepository.findAllPosts();

    const createdDate = new Date();
    const postId = randomUUID();

    const newPost: Post = {
      authorId,
      postId,
      title,
      description,
      createdData: createdDate,
      likes: [],
    };

    posts.push(newPost);
    await this.postsRepository.saveAllPosts(posts);

    return { title, createdDate };
  }

  async getUserPosts(userId: string): Promise<UserPostDto[]> {
    const [posts, users] = await Promise.all([
      this.postsRepository.findAllPosts(),
      this.postsRepository.findAllUsers(),
    ]);
    const usersMap = new Map(users.map((user) => [user.id, user]));
    const userPosts = posts.filter((post) => post.authorId === userId);

    return userPosts.map((post) => {
      const author = usersMap.get(post.authorId);
      return {
        title: post.title,
        description: post.description,
        createdData: post.createdData,
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
  ): Promise<{ title: string; updatedDate: Date }> {
    const { title, description } = updateData;

    const posts = await this.postsRepository.findAllPosts();
    const postIndex = posts.findIndex(
      (post) => post.authorId === authorId && post.postId === postId,
    );

    if (postIndex === -1) {
      throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    const updatedDate = new Date();
    posts[postIndex] = {
      ...posts[postIndex],
      title,
      description,
      updatedData: updatedDate,
    };
    await this.postsRepository.saveAllPosts(posts);

    return { title, updatedDate };
  }

  async deletePost(postId: string, authorId: string): Promise<boolean> {
    const posts = await this.postsRepository.findAllPosts();
    const postIndex = posts.findIndex(
      (post) => post.postId === postId && post.authorId === authorId,
    );

    if (postIndex === -1) {
      throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    posts.splice(postIndex, 1);
    await this.postsRepository.saveAllPosts(posts);

    return true;
  }

  async likePost(postId: string, userId: string): Promise<void> {
    const posts = await this.postsRepository.findAllPosts();
    const postIndex = posts.findIndex((post) => post.postId === postId);

    if (postIndex === -1) {
      throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    const likes = posts[postIndex].likes ?? [];
    if (!likes.includes(userId)) {
      likes.push(userId);
      posts[postIndex].likes = likes;
      await this.postsRepository.saveAllPosts(posts);
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const posts = await this.postsRepository.findAllPosts();
    const postIndex = posts.findIndex((post) => post.postId === postId);

    if (postIndex === -1) {
      throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    const likes = posts[postIndex].likes ?? [];
    const newLikes = likes.filter((id) => id !== userId);
    posts[postIndex].likes = newLikes;

    await this.postsRepository.saveAllPosts(posts);
  }
}
