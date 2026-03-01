import type { Request, Response, RequestHandler } from 'express';
import * as userService from '../services/userService.js';
import { notification } from '../services/emailService.js';
import {
    STATUS_OK,
    STATUS_CREATED,
    STATUS_NOT_FOUND,
    STATUS_CONFLICT,
    STATUS_SERVER_ERROR,
    STATUS_UNAUTHORIZED,
} from '../common/constants.js';
import { USERMESSAGES, MESSAGES } from '../common/messages.js';
import type { AuthRequest } from '../types/types.js';

export const register: RequestHandler = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const result = await userService.registerUser(req.body);
        res.status(STATUS_CREATED).json({
            success: true,
            message: USERMESSAGES.USER_REGISTERED,
            userName: result.Name,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === USERMESSAGES.USER_ALREADY_EXISTS
        ) {
            res.status(STATUS_CONFLICT).json({ error: error.message });
        } else {
            res.status(STATUS_SERVER_ERROR).json({
                error: MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    }
};

export const login: RequestHandler = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { Email, Password } = req.body;
        const result = await userService.loginUser(Email, Password);
        res.json({
            success: true,
            token: result.token,
            userEmail: result.userEmail,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === USERMESSAGES.USER_NOT_FOUND
        ) {
            res.status(STATUS_NOT_FOUND).json({ error: error.message });
        } else if (
            error instanceof Error &&
            error.message === USERMESSAGES.WRONG_PASSWORD
        ) {
            res.status(STATUS_UNAUTHORIZED).json({ error: error.message });
        } else {
            res.status(STATUS_SERVER_ERROR).json({
                error: MESSAGES.ERROR_READING_FILE,
            });
        }
    }
};

export const updateProfile: RequestHandler = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { Name, Lastname } = req.body;

        if (!Name || !Lastname) {
            res.status(STATUS_CONFLICT).send(MESSAGES.DATA_IS_EMPTY);
            return;
        }

        const result = await userService.updateUserProfile(
            (req as AuthRequest).user.Email,
            Name,
            Lastname
        );

        notification.emit(
            'profileUpdated',
            (req as AuthRequest).user.Email,
            Name,
            Lastname
        );

        res.status(STATUS_OK).json({
            success: true,
            message: USERMESSAGES.USER_UPDATED,
            NewuserName: result.name,
            NewLastname: result.lastname,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === USERMESSAGES.USER_NOT_FOUND
        ) {
            res.status(STATUS_NOT_FOUND).json({ error: error.message });
        } else {
            res.status(STATUS_SERVER_ERROR).json({
                error: MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    }
};

export const getAuthStatus: RequestHandler = (
    req: Request,
    res: Response
): void => {
    res.status(STATUS_OK).json({
        Name: (req as AuthRequest).user.Name,
        Lastname: (req as AuthRequest).user.Lastname,
        Email: (req as AuthRequest).user.Email,
    });
};
