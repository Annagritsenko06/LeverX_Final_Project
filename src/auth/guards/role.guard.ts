import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../guards/roles.decorators';
import type { AuthRequest } from '../../types/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    const hasRole = roles.includes(user.roleId);

    if (!hasRole) {
      throw new ForbiddenException({
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
        details: {
          requiredRoles: roles,
          userRole: user.roleId,
          reason: `User with role "${user.roleId}" does not have permission to access this resource. Required roles: ${roles.join(', ')}`,
        },
      });
    }

    return true;
  }
}
