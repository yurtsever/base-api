import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { USER_REPOSITORY_PORT } from '../../domain/ports/user-repository.port';
import { InsufficientPermissionsException } from '../../domain/exceptions/insufficient-permissions.exception';
import type { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user: jwtPayload } = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    if (!jwtPayload) {
      throw new InsufficientPermissionsException();
    }

    const user = await this.userRepository.findById(jwtPayload.sub);
    if (!user) {
      throw new InsufficientPermissionsException();
    }

    const hasAllPermissions = requiredPermissions.every((perm) => {
      const [resource, action] = perm.split(':');
      return user.hasPermission(resource, action);
    });

    if (!hasAllPermissions) {
      throw new InsufficientPermissionsException(`Required permissions: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
}
