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
    createdData: Date | string;
    updatedData?: Date | string;
}

export interface User {
    id: string;
    name: string;
    lastname: string;
    email: string;
    password: string;
}

export interface CreatePostInput {
    title: string;
    description: string;
}

export interface RegisterUserInput {
    name: string;
    lastname: string;
    email: string;
    password: string;
}
