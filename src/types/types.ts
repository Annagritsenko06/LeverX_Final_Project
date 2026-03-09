import type { Request } from 'express';

export interface AuthUser {
  id: string;
  name: string;
  lastname: string;
  email: string;
}

export interface AuthRequest extends Request {
  user: AuthUser;
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

export interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
}

export interface CreatePostInput {
  authorId: string;
  title: string;
  description: string;
}

export interface RegisterUserInput {
  name: string;
  lastname: string;
  email: string;
  password: string;
}

export interface UserPostDto {
  title: string;
  description: string;
  createdData: Date | string;
  author: string;
}
