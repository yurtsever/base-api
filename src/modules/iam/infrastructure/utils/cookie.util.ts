import type { Response } from 'express';
import type { ConfigService } from '@nestjs/config';

export interface RefreshCookieOptions {
  refreshToken: string;
  refreshExpiresIn: number;
}

/**
 * Resolve the cookie `secure` flag. In production the refresh-token cookie must
 * never travel over plain HTTP, so we force `secure: true` regardless of the
 * configured value; otherwise we honor the `cookie.secure` config.
 */
function resolveSecure(configService: ConfigService): boolean {
  const isProduction = configService.get<string>('app.nodeEnv', 'development') === 'production';
  return isProduction || configService.get<boolean>('cookie.secure', false);
}

export function setRefreshTokenCookie(
  res: Response,
  configService: ConfigService,
  options: RefreshCookieOptions,
): void {
  const domain = configService.get<string>('cookie.domain', '');
  const secure = resolveSecure(configService);
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
  const secure = resolveSecure(configService);
  const sameSite = configService.get<'strict' | 'lax' | 'none'>('cookie.sameSite', 'strict');

  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure,
    sameSite,
    ...(domain ? { domain } : {}),
    path: '/api/auth/refresh',
  });
}
