import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import type { Request } from 'express';
import { PostsService } from './posts.service';
import { POSTSMESSAGES, MESSAGES } from '../common/messages';
import type { AuthRequest } from '../types/types';
import { AuthGuard } from '../auth/auth.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
@UseGuards(AuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('/')
  async createPost(@Req() req: Request, @Body() postBody: CreatePostDto) {
    const authReq = req as AuthRequest;
    const result = await this.postsService.createPost(
      authReq.user.id,
      postBody,
    );

    return {
      success: true,
      message: POSTSMESSAGES.POST_CREATED,
      title: result.title,
      createdData: result.createdDate,
    };
  }

  @Get(':userId')
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('sortBy') sortBy: 'createdData' | 'title' = 'createdData',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('title') title?: string,
  ) {
    const posts = await this.postsService.getUserPosts(userId, {
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
      title,
    });
    return {
      success: true,
      posts,
    };
  }

  @Put(':postId')
  async updatePost(
    @Req() req: Request,
    @Param('postId') postId: string,
    @Body() postBody: UpdatePostDto,
  ) {
    const authReq = req as AuthRequest;
    const result = await this.postsService.updatePost(
      postId,
      authReq.user.id,
      postBody,
    );

    return {
      success: true,
      message: POSTSMESSAGES.POST_UPDATED,
      title: result.title,
      updatedData: result.updatedData,
    };
  }

  @Delete(':postId')
  async deletePost(@Req() req: Request, @Param('postId') postId: string) {
    const authReq = req as AuthRequest;
    await this.postsService.deletePost(postId, authReq.user.id);

    return {
      success: true,
      message: POSTSMESSAGES.POST_DELETED,
    };
  }

  @Post(':postId/like')
  async likePost(@Req() req: Request, @Param('postId') postId: string) {
    const authReq = req as AuthRequest;
    await this.postsService.likePost(postId, authReq.user.id);

    return {
      success: true,
      message: 'Like added',
    };
  }

  @Delete(':postId/like')
  async unlikePost(@Req() req: Request, @Param('postId') postId: string) {
    const authReq = req as AuthRequest;
    await this.postsService.unlikePost(postId, authReq.user.id);

    return {
      success: true,
      message: 'Like removed',
    };
  }
}
