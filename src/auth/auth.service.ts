import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthRequest, AuthUser, User } from '../types/types.js';
import { FileHelpers } from '../common/fileHelpers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private dataFile: string;
  constructor(
    private jwtService: JwtService,
    private fileHelpers: FileHelpers,
    private ConfigService: ConfigService,
  ) {
    this.dataFile = this.ConfigService.get<string>('DATA_FILE', {
      infer: true,
    })!;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No access');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthUser>(token);
      const user = await this.validate(payload);

      (req as AuthRequest).user = payload;

      return true;
    } catch {
      throw new ForbiddenException('Token expired');
    }
  }

  async validate(req: AuthUser): Promise<User> {
    const users = await this.fileHelpers.readFile<User[]>(this.dataFile);
    const existingUser = users.find((user) => user.id === req.id);
    if (!existingUser) {
      throw new UnauthorizedException('User doesnt exist');
    }
    return existingUser;
  }
}
