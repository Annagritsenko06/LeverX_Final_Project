import type { Request, Response, RequestHandler } from 'express';
import * as userService from '../services/userService.js';
import { notification } from '../services/emailService.js';
import { HttpStatus } from '../common/constants.js';
import { USERMESSAGES, MESSAGES } from '../common/messages.js';
import type { AuthRequest } from '../types/types.js';

export const register: RequestHandler = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const result = await userService.registerUser(req.body);
        res.status(HttpStatus.CREATED).json({
            success: true,
            message: USERMESSAGES.USER_REGISTERED,
            userName: result.name,
        });
    } catch (error) {
        if (!(error instanceof Error)) {
            res.status(HttpStatus.SERVER_ERROR).json({
                error: MESSAGES.INTERNAL_SERVER_ERROR,
            });
            return;
        }

        if (error.message === USERMESSAGES.USER_ALREADY_EXISTS) {
            res.status(HttpStatus.CONFLICT).json({ error: error.message });
        } else {
            res.status(HttpStatus.SERVER_ERROR).json({
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
        if (!(error instanceof Error)) {
            res.status(HttpStatus.SERVER_ERROR).json({
                error: MESSAGES.ERROR_READING_FILE,
            });
            return;
        }

        if (error.message === USERMESSAGES.USER_NOT_FOUND) {
            res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
        } else if (error.message === USERMESSAGES.WRONG_PASSWORD) {
            res.status(HttpStatus.UNAUTHORIZED).json({ error: error.message });
        } else {
            res.status(HttpStatus.SERVER_ERROR).json({
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
            res.status(HttpStatus.CONFLICT).send(MESSAGES.DATA_IS_EMPTY);
            return;
        }

        const authReq = req as AuthRequest;
        const result = await userService.updateUserProfile(
            authReq.user.email,
            Name,
            Lastname
        );

        notification.emit('profileUpdated', authReq.user.email, Name, Lastname);

        res.status(HttpStatus.OK).json({
            success: true,
            message: USERMESSAGES.USER_UPDATED,
            NewuserName: result.name,
            NewLastname: result.lastname,
        });
    } catch (error) {
        if (!(error instanceof Error)) {
            res.status(HttpStatus.SERVER_ERROR).json({
                error: MESSAGES.INTERNAL_SERVER_ERROR,
            });
            return;
        }

        if (error.message === USERMESSAGES.USER_NOT_FOUND) {
            res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
        } else {
            res.status(HttpStatus.SERVER_ERROR).json({
                error: MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    }
};

export const getAuthStatus: RequestHandler = (
    req: Request,
    res: Response
): void => {
    res.status(HttpStatus.OK).json({
        name: (req as AuthRequest).user.name,
        lastname: (req as AuthRequest).user.lastname,
        email: (req as AuthRequest).user.email,
    });
};
