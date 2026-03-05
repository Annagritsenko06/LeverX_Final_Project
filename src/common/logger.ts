import { Injectable } from '@nestjs/common';
import winston from 'winston';
import 'dotenv/config';
@Injectable()
export class LoggerService {
  private logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: process.env.filename }),
    ],
  });
}
