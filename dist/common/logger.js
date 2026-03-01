import winston from 'winston';
import 'dotenv/config';
export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: process.env.filename }),
    ],
});
