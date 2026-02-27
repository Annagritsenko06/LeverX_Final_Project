import jwt from 'jsonwebtoken';
import { STATUS_UNAUTHORIZED, STATUS_FORBIDDEN } from '../common/constants.js';
import { USERMESSAGES, MESSAGES } from '../common/messages.js';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res
            .status(STATUS_UNAUTHORIZED)
            .send(USERMESSAGES.USER_NO_ACCESS);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(STATUS_FORBIDDEN).send(MESSAGES.TOKEN_EXPIRED);
        }
        console.log('req.user:', user);
        req.user = user;
        next();
    });
}
