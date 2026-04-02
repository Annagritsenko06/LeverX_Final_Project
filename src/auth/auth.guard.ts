import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthRequest, AuthUser, User } from '../types/types';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthRequest>();

    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No access');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthUser>(token);
      await this.validate(payload);
      req.user = payload;
      return true;
    } catch {
      throw new ForbiddenException('Token expired');
    }
  }

  async validate(req: AuthUser): Promise<User | null> {
    const existingUser = await this.userRepository.findUserByGoogleSub(
      req.googleSub,
    );
    if (!existingUser) {
      throw new UnauthorizedException('User doesnt exist');
    }

    if (req.sessionVersion !== existingUser.sessionVersion) {
      throw new UnauthorizedException('Token outdated - please login again');
    }
    return existingUser;
  }
}
