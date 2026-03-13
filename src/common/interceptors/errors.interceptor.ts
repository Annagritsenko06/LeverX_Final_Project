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
import { catchError } from 'rxjs/operators';
import { USERMESSAGES, POSTSMESSAGES, MESSAGES } from '../messages.js';
import { DatabaseError } from '@sequelize/core';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      catchError((error) => {
        throw this.handleError(error);
      }),
    );
  }

  private handleError(error: unknown) {
    if (error instanceof HttpException) {
      throw error;
    }

    if (error instanceof DatabaseError) {
      return this.handleDatabaseError(error);
    }

    if (error instanceof Error) {
      return this.handleApplicationError(error);
    }

    throw new InternalServerErrorException();
  }
  private handleDatabaseError(error: DatabaseError) {
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
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }

  private handleApplicationError(error: Error) {
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
  }
}
