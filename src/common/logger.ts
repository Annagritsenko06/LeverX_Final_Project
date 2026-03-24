import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import winston from 'winston';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: this.configService.get<string>('LOG_FILE') ?? 'Logs.json',
        }),
      ],
    });
  }

  log(message: string, meta?: object) {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: object) {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: object) {
    this.logger.warn(message, meta);
  }

  getLogs(): string {
    return this.configService.get<string>('LOG_FILE') ?? 'Logs.json';
  }
}
