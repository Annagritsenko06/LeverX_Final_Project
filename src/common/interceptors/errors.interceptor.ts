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
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { USERMESSAGES, POSTSMESSAGES, MESSAGES } from '../messages';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpException) {
          throw error;
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

