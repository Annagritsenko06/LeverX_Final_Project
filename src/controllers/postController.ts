import * as postService from '../services/postService.js';
import type { Request, Response } from 'express';
import {
    STATUS_OK,
    STATUS_CREATED,
    STATUS_NOT_FOUND,
    STATUS_SERVER_ERROR,
} from '../common/constants.js';
import { POSTSMESSAGES, MESSAGES } from '../common/messages.js';
import type { AuthRequest } from '../types/types.js';

export async function createPost(req: Request, res: Response): Promise<void> {
    try {
        const authReq = req as AuthRequest;
        const result = await postService.createPost(authReq.user.Id, req.body);

        res.status(STATUS_CREATED).json({
            success: true,
            message: POSTSMESSAGES.POST_CREATED,
            Title: result.Title,
            Created_data: result.created_date,
        });
    } catch (error) {
        res.status(STATUS_SERVER_ERROR).json({
            error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
}

export async function getUserPosts(req: Request, res: Response): Promise<void> {
    try {
        const { userId } = req.params as { userId: string };
        const posts = await postService.getUserPosts(userId);

        res.status(STATUS_OK).json({
            success: true,
            posts,
        });
    } catch (error) {
        res.status(STATUS_SERVER_ERROR).json({
            error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
}

export async function updatePost(req: Request, res: Response): Promise<void> {
    try {
        const authReq = req as AuthRequest;
        const { postId } = req.params as { postId: string };
        const result = await postService.updatePost(
            postId,
            authReq.user.Id,
            req.body
        );

        res.status(STATUS_OK).json({
            success: true,
            message: POSTSMESSAGES.POST_UPDATED,
            Title: result.Title,
            Created_data: result.updated_date,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === POSTSMESSAGES.POST_NOT_FOUND
        ) {
            res.status(STATUS_NOT_FOUND).json({ error: error.message });
        } else {
            res.status(STATUS_SERVER_ERROR).json({
                error: MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    }
}

export async function deletePost(req: Request, res: Response): Promise<void> {
    try {
        const authReq = req as AuthRequest;
        const { postId } = req.params as { postId: string };
        await postService.deletePost(postId, authReq.user.Id);

        res.status(STATUS_OK).json({
            success: true,
            message: POSTSMESSAGES.POST_DELETED,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === POSTSMESSAGES.POST_NOT_FOUND
        ) {
            res.status(STATUS_NOT_FOUND).json({ error: error.message });
        } else {
            res.status(STATUS_SERVER_ERROR).json({
                error: MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    }
}
