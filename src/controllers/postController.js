import * as postService from '../services/postService.js';
import {
    STATUS_OK,
    STATUS_CREATED,
    STATUS_NOT_FOUND,
    STATUS_SERVER_ERROR,
} from '../common/constants.js';
import { POSTSMESSAGES, MESSAGES } from '../common/messages.js';

export async function createPost(req, res) {
    try {
        const result = await postService.createPost(req.user.Id, req.body);

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

export async function getUserPosts(req, res) {
    try {
        const { userId } = req.params;
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

export async function updatePost(req, res) {
    try {
        const { postId } = req.params;
        const result = await postService.updatePost(
            postId,
            req.user.Id,
            req.body
        );

        res.status(STATUS_OK).json({
            success: true,
            message: POSTSMESSAGES.POST_UPDATED,
            Title: result.Title,
            Created_data: result.updated_date,
        });
    } catch (error) {
        if (error.message === POSTSMESSAGES.POST_NOT_FOUND) {
            res.status(STATUS_NOT_FOUND).json({ error: error.message });
        } else {
            res.status(STATUS_SERVER_ERROR).json({
                error: MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    }
}

export async function deletePost(req, res) {
    try {
        const { postId } = req.params;
        await postService.deletePost(postId, req.user.Id);

        res.status(STATUS_OK).json({
            success: true,
            message: POSTSMESSAGES.POST_DELETED,
        });
    } catch (error) {
        if (error.message === POSTSMESSAGES.POST_NOT_FOUND) {
            res.status(STATUS_NOT_FOUND).json({ error: error.message });
        } else {
            res.status(STATUS_SERVER_ERROR).json({
                error: MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    }
}
