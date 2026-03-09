import { Injectable } from '@nestjs/common';
import { POSTSMESSAGES, MESSAGES } from '../common/messages';
import type { CreatePostInput, UserPostDto } from '../types/types';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async createPost(
    authorId: string,
    postData: { title: string; description: string },
  ): Promise<{ title: string; createdDate: Date }> {
    const { title, description } = postData;

    const createdPost = await this.postsRepository.addPost({
      authorId,
      title,
      description,
    });
    return { title: createdPost.title, createdDate: createdPost.createdData };
  }

  async getUserPosts(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'createdData' | 'title';
      sortOrder?: 'ASC' | 'DESC';
      title?: string;
    } = {},
  ): Promise<UserPostDto[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdData',
      sortOrder = 'DESC',
      title,
    } = options;

    const allPosts = await this.postsRepository.getAllPosts(userId);

    let filtered = allPosts;
    if (title) {
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(title.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      const dir = sortOrder === 'ASC' ? 1 : -1;
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title) * dir;
      }
      return (
        (new Date(a.createdData).getTime() -
          new Date(b.createdData).getTime()) *
        dir
      );
    });

    const offset = (page - 1) * limit;
    const paged = filtered.slice(offset, offset + limit);

    return paged.map((post) => ({
      title: post.title,
      description: post.description,
      createdData: post.createdData,
      author: post.User
        ? `${post.User.name} ${post.User.lastname}`
        : MESSAGES.UNKNOWN_AUTHOR,
    }));
  }

  async updatePost(
    postId: string,
    authorId: string,
    updateData: { title: string; description: string },
  ): Promise<{ title: string; updatedData?: Date }> {
    const { title, description } = updateData;

    const updatedPost = await this.postsRepository.updatePost(
      postId,
      title,
      description,
    );
    if (!updatedPost) {
      throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }
    return { title: updatedPost.title, updatedData: updatedPost.updatedData };
  }

  async deletePost(postId: string, authorId: string): Promise<boolean> {
    const deletedCount = await this.postsRepository.deletePost(postId);

    if (deletedCount === 0) {
      throw new Error(POSTSMESSAGES.POST_NOT_FOUND);
    }

    return true;
  }

  async likePost(postId: string, userId: string): Promise<void> {
    await this.postsRepository.addLike(postId, userId);
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    await this.postsRepository.deleteLike(postId, userId);
  }
}
