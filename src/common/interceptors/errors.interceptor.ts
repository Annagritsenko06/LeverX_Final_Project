import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { USERMESSAGES, POSTSMESSAGES, MESSAGES } from '../messages';
import { Sequelize, DatabaseError } from '@sequelize/core';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpException) {
          throw error;
        }

        if (error instanceof DatabaseError) {
          if (
            error.name === 'SequelizeDatabaseError' ||
            error.message.includes('Unknown column') ||
            error.message.includes("doesn't exist")
          ) {
            throw new BadRequestException({
              error: 'Invalid database query',
              details:
                process.env.NODE_ENV === 'development'
                  ? error.message
                  : undefined,
            });
          }

          if (
            error.message.includes('Duplicate entry') ||
            error.message.includes('ER_DUP_ENTRY')
          ) {
            throw new ConflictException({ error: 'Record already exists' });
          }

          if (
            error.message.includes('FOREIGN KEY') ||
            error.message.includes('ER_NO_REFERENCED_ROW')
          ) {
            throw new BadRequestException({ error: 'Related data not found' });
          }

          throw new InternalServerErrorException({
            error: 'Database error',
            details:
              process.env.NODE_ENV === 'development'
                ? error.message
                : undefined,
          });
        }

        if (error instanceof Error) {
          switch (error.message) {
            case USERMESSAGES.USER_NOT_FOUND:
              throw new NotFoundException({ error: error.message });
            case USERMESSAGES.WRONG_PASSWORD:
              throw new UnauthorizedException({ error: error.message });
            case USERMESSAGES.USER_ALREADY_EXISTS:
              throw new ConflictException({ error: error.message });
            case POSTSMESSAGES.POST_NOT_FOUND:
              throw new NotFoundException({ error: error.message });
            default:
              console.error('Unknown error:', error.message);
              throw new InternalServerErrorException({
                error: MESSAGES.INTERNAL_SERVER_ERROR,
              });
          }
        }

        throw new InternalServerErrorException({
          error: MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }),
    );
  }
}
