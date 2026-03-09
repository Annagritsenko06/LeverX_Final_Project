import { Injectable } from '@nestjs/common';
import { DataRepository } from '../common/dataRepository';
import type {
  Post as PostType,
  User as UserType,
  CreatePostInput,
} from '../types/types';

@Injectable()
export class PostsRepository {
  constructor(private readonly fileHelpers: DataRepository) {}

  async addPost(post: CreatePostInput): Promise<PostType> {
    return this.fileHelpers.addPost(post);
  }

  async updatePost(
    postId: string,
    title: string,
    description: string,
  ): Promise<PostType | null> {
    return this.fileHelpers.updatePost(postId, title, description);
  }

  async deletePost(postId: string): Promise<number> {
    return this.fileHelpers.deletePost(postId);
  }
  async addLike(postId: string, userId: string): Promise<PostType | null> {
    return this.fileHelpers.addLike(postId, userId);
  }

  async deleteLike(postId: string, userId: string): Promise<PostType | null> {
    return this.fileHelpers.deleteLike(postId, userId);
  }
  async getAllPosts(authorId: string): Promise<PostType[]> {
    return this.fileHelpers.getAllPosts(authorId);
  }

  async findPostById(
    authorId: string,
    postId: string,
  ): Promise<PostType | null> {
    return this.fileHelpers.findPostById(authorId, postId);
  }
}
