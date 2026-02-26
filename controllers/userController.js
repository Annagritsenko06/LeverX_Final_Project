import * as userService from '../services/userService.js';
import { usersUpdate } from '../services/emailService.js';
import {
    STATUS_OK,
    STATUS_CREATED,
    STATUS_NOT_FOUND,
    STATUS_CONFLICT,
    STATUS_SERVER_ERROR,
    STATUS_UNAUTHORIZED,
} from '../config/constants.js';

export async function register(req, res) {
    try {
        const result = await userService.registerUser(req.body);
        res.status(STATUS_CREATED).json({
            success: true,
            message: 'User successfully registered',
            userName: result.Name,
        });
    } catch (error) {
        if (error.message === 'User already exists') {
            res.status(STATUS_CONFLICT).json({ error: error.message });
        } else {
            res.status(STATUS_SERVER_ERROR).json({
                error: 'Internal Server Error',
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
        if (error.message === 'User not found') {
            res.status(STATUS_NOT_FOUND).json({ error: error.message });
        } else if (error.message === 'Wrong password') {
            res.status(STATUS_UNAUTHORIZED).json({ error: error.message });
        } else {
            res.status(STATUS_SERVER_ERROR).json({
                error: 'Error reading file',
            });
        }
    }
}

export async function updateProfile(req, res) {
    try {
        const { Name, Lastname } = req.body;

        if (!Name || !Lastname) {
            return res.status(STATUS_CONFLICT).send('Entered data is empty');
        }

        const result = await userService.updateUserProfile(
            req.user.Email,
            Name,
            Lastname
        );

        usersUpdate.emit('profileUpdated', req.user.Email, Name, Lastname);

        res.status(STATUS_OK).json({
            success: true,
            message: 'User successfully updated',
            NewuserName: result.name,
            NewLastname: result.lastname,
        });
    } catch (error) {
        if (error.message === 'User not found') {
            res.status(STATUS_NOT_FOUND).json({ error: error.message });
        } else {
            res.status(STATUS_SERVER_ERROR).json({
                error: 'Internal Server Error',
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
