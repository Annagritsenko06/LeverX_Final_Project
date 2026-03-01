import type { Request } from 'express';

export interface AuthUser {
    Id: string;
    Name: string;
    Lastname: string;
    Email: string;
}

export interface AuthRequest extends Request {
    user: AuthUser;
}

export interface Post {
    authorId: string;
    Post_id: string;
    Title: string;
    Description: string;
    Created_data: Date | string;
    Updated_data?: Date | string;
}

export interface User {
    Id: string;
    Name: string;
    Lastname: string;
    Email: string;
    Password: string;
}

export interface CreatePostInput {
    Title: string;
    Description: string;
}

export interface RegisterUserInput {
    Name: string;
    Lastname: string;
    Email: string;
    Password: string;
}
