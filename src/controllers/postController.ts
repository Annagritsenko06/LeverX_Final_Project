import * as postService from '../services/postService.js';
import type { Request, Response } from 'express';
import { HttpStatus } from '../common/constants.js';
import { POSTSMESSAGES, MESSAGES } from '../common/messages.js';
import type { AuthRequest } from '../types/types.js';

export async function createPost(req: Request, res: Response): Promise<void> {
    try {
        const authReq = req as AuthRequest;
        const result = await postService.createPost(authReq.user.id, req.body);

        res.status(HttpStatus.CREATED).json({
            success: true,
            message: POSTSMESSAGES.POST_CREATED,
            title: result.title,
            created_data: result.created_date,
        });
    } catch (error) {
        res.status(HttpStatus.SERVER_ERROR).json({
            error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
}

export async function getUserPosts(req: Request, res: Response): Promise<void> {
    try {
        const { userId } = req.params as { userId: string };
        const posts = await postService.getUserPosts(userId);

        res.status(HttpStatus.OK).json({
            success: true,
            posts,
        });
    } catch (error) {
        res.status(HttpStatus.SERVER_ERROR).json({
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
            authReq.user.id,
            req.body
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

export async function deletePost(req: Request, res: Response): Promise<void> {
    try {
        const authReq = req as AuthRequest;
        const { postId } = req.params as { postId: string };
        await postService.deletePost(postId, authReq.user.id);

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
