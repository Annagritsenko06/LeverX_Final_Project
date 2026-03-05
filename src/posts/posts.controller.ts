import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PostsService } from './posts.service';
import { HttpStatus } from '../common/constants';
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
  async createPost(
    @Req() req: Request,
    @Res() res: Response,
    @Body() postBody: CreatePostDto,
  ): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const result = await this.postsService.createPost(
        authReq.user.id,
        postBody,
      );

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: POSTSMESSAGES.POST_CREATED,
        title: result.title,
        created_data: result.created_date,
      });
    } catch {
      res.status(HttpStatus.SERVER_ERROR).json({
        error: MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Get(':userId')
  async getUserPosts(
    @Param('userId') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const posts = await this.postsService.getUserPosts(userId);

      res.status(HttpStatus.OK).json({
        success: true,
        posts,
      });
    } catch {
      res.status(HttpStatus.SERVER_ERROR).json({
        error: MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Put(':postId')
  async updatePost(
    @Req() req: Request,
    @Res() res: Response,
    @Param('postId') postId: string,
    @Body() postBody: UpdatePostDto,
  ): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const result = await this.postsService.updatePost(
        postId,
        authReq.user.id,
        postBody,
      );

      res.status(HttpStatus.OK).json({
        success: true,
        message: POSTSMESSAGES.POST_UPDATED,
        title: result.title,
        updated_data: result.updated_date,
      });
    } catch (error) {
      if (!(error instanceof Error)) {
        res.status(HttpStatus.SERVER_ERROR).json({
          error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }

      if (error.message === POSTSMESSAGES.POST_NOT_FOUND) {
        res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
      } else {
        res.status(HttpStatus.SERVER_ERROR).json({
          error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  @Delete(':postId')
  async deletePost(
    @Req() req: Request,
    @Res() res: Response,
    @Param('postId') postId: string,
  ): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      await this.postsService.deletePost(postId, authReq.user.id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: POSTSMESSAGES.POST_DELETED,
      });
    } catch (error) {
      if (!(error instanceof Error)) {
        res.status(HttpStatus.SERVER_ERROR).json({
          error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }

      if (error.message === POSTSMESSAGES.POST_NOT_FOUND) {
        res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
      } else {
        res.status(HttpStatus.SERVER_ERROR).json({
          error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  @Post(':postId/like')
  async likePost(
    @Req() req: Request,
    @Res() res: Response,
    @Param('postId') postId: string,
  ): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      await this.postsService.likePost(postId, authReq.user.id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Like added',
      });
    } catch (error) {
      if (!(error instanceof Error)) {
        res.status(HttpStatus.SERVER_ERROR).json({
          error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }

      if (error.message === POSTSMESSAGES.POST_NOT_FOUND) {
        res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
      } else {
        res.status(HttpStatus.SERVER_ERROR).json({
          error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  @Delete(':postId/like')
  async unlikePost(
    @Req() req: Request,
    @Res() res: Response,
    @Param('postId') postId: string,
  ): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      await this.postsService.unlikePost(postId, authReq.user.id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Like removed',
      });
    } catch (error) {
      if (!(error instanceof Error)) {
        res.status(HttpStatus.SERVER_ERROR).json({
          error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }

      if (error.message === POSTSMESSAGES.POST_NOT_FOUND) {
        res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
      } else {
        res.status(HttpStatus.SERVER_ERROR).json({
          error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }
}
