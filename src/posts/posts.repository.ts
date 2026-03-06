import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileHelpers } from '../common/fileHelpers';
import type { Post, User } from '../types/types';

@Injectable()
export class PostsRepository {
  private readonly postsFile: string;
  private readonly usersFile: string;

  constructor(
    private readonly fileHelpers: FileHelpers,
    private readonly configService: ConfigService,
  ) {
    this.postsFile = this.configService.get<string>('POSTS_FILE', {
      infer: true,
    })!;
    this.usersFile = this.configService.get<string>('DATA_FILE', {
      infer: true,
    })!;
  }

  findAllPosts(): Promise<Post[]> {
    return this.fileHelpers.readFile<Post[]>(this.postsFile);
  }

  saveAllPosts(posts: Post[]): Promise<void> {
    return this.fileHelpers.writeFile(this.postsFile, posts);
  }

  findAllUsers(): Promise<User[]> {
    return this.fileHelpers.readFile<User[]>(this.usersFile);
  }
}

