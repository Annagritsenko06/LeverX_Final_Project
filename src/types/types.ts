import type { Request } from 'express';

export interface AuthUser {
  id: string;
  name: string;
  lastname: string;
  email: string;
  googleSub: string;
  sessionVersion: number;
  roleId: string;
}

export interface AuthRequest extends Request {
  user: AuthUser;
}

export interface Vinyl {
  authorName: string;
  vinylId: string;
  name: string;
  description: string;
  price: number;
  firstReview?: string;
  averageScope?: number;
  image: string;
  User?: User;
}

export interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  googleSub?: string;
  birthdate?: Date;
  avatar?: string;
  sessionVersion?: number;
  roleId: string;
}

export interface CreateVinylInput {
  authorName: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface RegisterUserInput {
  name: string;
  lastname: string;
  email: string;
  googleSub?: string;
  avatar?: string;
  roleId?: string;
}

export interface UserVinylDto {
  name: string;
  description: string;
  authorName: string;
  price: number;
  image: string;
  firstReview?: string;
  averageScope?: number;
}

export interface Review {
  reviewId: string;
  usderId: string;
  comment: string;
  authorName: string;
  reviewScore: number;
}
export interface VinylReviews {
  comment: string;
  authorName?: string;
  reviewScore: number;
}
export interface CreateReviewInput {
  description: string;
  reviewScore: number;
}

export type GoogleRegisterUserInput = RegisterUserInput & { avatar: string };
