import type { Response } from 'express';
import type { ConfigService } from '@nestjs/config';

export interface RefreshCookieOptions {
  refreshToken: string;
  refreshExpiresIn: number;
}

export function setRefreshTokenCookie(
  res: Response,
  configService: ConfigService,
  options: RefreshCookieOptions,
): void {
  const domain = configService.get<string>('cookie.domain', '');
  const secure = configService.get<boolean>('cookie.secure', false);
  const sameSite = configService.get<'strict' | 'lax' | 'none'>('cookie.sameSite', 'strict');

  res.cookie('refresh_token', options.refreshToken, {
    httpOnly: true,
    secure,
    sameSite,
    ...(domain ? { domain } : {}),
    path: '/api/auth/refresh',
    maxAge: options.refreshExpiresIn * 1000,
  });
}

export function clearRefreshTokenCookie(res: Response, configService: ConfigService): void {
  const domain = configService.get<string>('cookie.domain', '');
  const secure = configService.get<boolean>('cookie.secure', false);
  const sameSite = configService.get<'strict' | 'lax' | 'none'>('cookie.sameSite', 'strict');

  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure,
    sameSite,
    ...(domain ? { domain } : {}),
    path: '/api/auth/refresh',
  });
}
