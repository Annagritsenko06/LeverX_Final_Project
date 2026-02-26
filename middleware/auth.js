import jwt from 'jsonwebtoken';
import { STATUS_UNAUTHORIZED, STATUS_FORBIDDEN } from '../config/constants.js';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(STATUS_UNAUTHORIZED).send(
            'You don’t have access to this resource'
        );
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            res.status(STATUS_FORBIDDEN).send('Token expired');
        }
        console.log('req.user:', user);
        req.user = user;
        next();
    });
}
