import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | string | string[] => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    if (data) {
      return user[data];
    }

    return user;
  },
);
