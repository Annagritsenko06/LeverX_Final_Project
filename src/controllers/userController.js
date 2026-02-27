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

export async function register(req, res) {
    try {
        const result = await userService.registerUser(req.body);
        res.status(STATUS_CREATED).json({
            success: true,
            message: USERMESSAGES.USER_REGISTERED,
            userName: result.Name,
        });
    } catch (error) {
        if (error.message === USERMESSAGES.USER_ALREADY_EXISTS) {
            res.status(STATUS_CONFLICT).json({ error: error.message });
        } else {
            res.status(STATUS_SERVER_ERROR).json({
                error: MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    }
}

export async function login(req, res) {
    try {
        const { Email, Password } = req.body;
        const result = await userService.loginUser(Email, Password);
        res.json({
            success: true,
            token: result.token,
            userEmail: result.userEmail,
        });
    } catch (error) {
        if (error.message === USERMESSAGES.USER_NOT_FOUND) {
            res.status(STATUS_NOT_FOUND).json({ error: error.message });
        } else if (error.message === USERMESSAGES.WRONG_PASSWORD) {
            res.status(STATUS_UNAUTHORIZED).json({ error: error.message });
        } else {
            res.status(STATUS_SERVER_ERROR).json({
                error: MESSAGES.ERROR_READING_FILE,
            });
        }
    }
}

export async function updateProfile(req, res) {
    try {
        const { Name, Lastname } = req.body;

        if (!Name || !Lastname) {
            return res.status(STATUS_CONFLICT).send(MESSAGES.DATA_IS_EMPTY);
        }

        const result = await userService.updateUserProfile(
            req.user.Email,
            Name,
            Lastname
        );

        notification.emit('profileUpdated', req.user.Email, Name, Lastname);

        res.status(STATUS_OK).json({
            success: true,
            message: USERMESSAGES.USER_UPDATED,
            NewuserName: result.name,
            NewLastname: result.lastname,
        });
    } catch (error) {
        if (error.message === USERMESSAGES.USER_NOT_FOUND) {
            res.status(STATUS_NOT_FOUND).json({ error: error.message });
        } else {
            res.status(STATUS_SERVER_ERROR).json({
                error: MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    }
}

export function getAuthStatus(req, res) {
    res.status(STATUS_OK).json({
        Name: req.user.Name,
        Lastname: req.user.Lastname,
        Email: req.user.Email,
    });
}
