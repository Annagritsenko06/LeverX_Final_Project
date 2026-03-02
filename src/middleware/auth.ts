import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../common/constants.js';
import { USERMESSAGES, MESSAGES } from '../common/messages.js';
import type { AuthRequest, AuthUser } from '../types/types.js';

export function authenticateToken(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.header('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(HttpStatus.UNAUTHORIZED).send(USERMESSAGES.USER_NO_ACCESS);
        return;
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET as string,
        (err: jwt.VerifyErrors | null, user: unknown) => {
            if (err) {
                res.status(HttpStatus.FORBIDDEN).send(MESSAGES.TOKEN_EXPIRED);
                return;
            }
            console.log('req.user:', user);
            (req as AuthRequest).user = user as AuthUser;
            next();
        }
    );
}
