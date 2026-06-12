import { setRefreshTokenCookie, clearRefreshTokenCookie } from './cookie.util';
import type { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

describe('Cookie Utilities', () => {
  let res: { cookie: jest.Mock; clearCookie: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(() => {
    res = { cookie: jest.fn(), clearCookie: jest.fn() };
    configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        const config: Record<string, unknown> = {
          'cookie.domain': 'example.com',
          'cookie.secure': true,
          'cookie.sameSite': 'strict',
        };
        return config[key] ?? defaultValue;
      }),
    };
  });

  describe('setRefreshTokenCookie', () => {
    it('should set refresh_token cookie with correct options', () => {
      setRefreshTokenCookie(res as unknown as Response, configService as unknown as ConfigService, {
        refreshToken: 'refresh-hex',
        refreshExpiresIn: 604800,
      });

      expect(res.cookie).toHaveBeenCalledTimes(1);
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh-hex', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        domain: 'example.com',
        path: '/api/auth/refresh',
        maxAge: 604_800_000,
      });
    });

    it('should force secure=true in production even when cookie.secure is false', () => {
      configService.get.mockImplementation((key: string, defaultValue?: unknown) => {
        const config: Record<string, unknown> = {
          'app.nodeEnv': 'production',
          'cookie.domain': '',
          'cookie.secure': false,
          'cookie.sameSite': 'strict',
        };
        return config[key] ?? defaultValue;
      });

      setRefreshTokenCookie(res as unknown as Response, configService as unknown as ConfigService, {
        refreshToken: 'refresh',
        refreshExpiresIn: 3600,
      });

      const calls = res.cookie.mock.calls as unknown[][];
      const cookieOptions = calls[0][2] as Record<string, unknown>;
      expect(cookieOptions['secure']).toBe(true);
    });

    it('should omit domain when empty', () => {
      configService.get.mockImplementation((key: string, defaultValue?: unknown) => {
        const config: Record<string, unknown> = {
          'cookie.domain': '',
          'cookie.secure': false,
          'cookie.sameSite': 'lax',
        };
        return config[key] ?? defaultValue;
      });

      setRefreshTokenCookie(res as unknown as Response, configService as unknown as ConfigService, {
        refreshToken: 'refresh',
        refreshExpiresIn: 3600,
      });

      const calls = res.cookie.mock.calls as unknown[][];
      const cookieOptions = calls[0][2] as Record<string, unknown>;
      expect(cookieOptions).not.toHaveProperty('domain');
      expect(cookieOptions['secure']).toBe(false);
      expect(cookieOptions['sameSite']).toBe('lax');
    });
  });

  describe('clearRefreshTokenCookie', () => {
    it('should clear refresh_token cookie', () => {
      clearRefreshTokenCookie(res as unknown as Response, configService as unknown as ConfigService);

      expect(res.clearCookie).toHaveBeenCalledTimes(1);
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        domain: 'example.com',
        path: '/api/auth/refresh',
      });
    });

    it('should force secure=true in production even when cookie.secure is false', () => {
      configService.get.mockImplementation((key: string, defaultValue?: unknown) => {
        const config: Record<string, unknown> = {
          'app.nodeEnv': 'production',
          'cookie.domain': '',
          'cookie.secure': false,
          'cookie.sameSite': 'strict',
        };
        return config[key] ?? defaultValue;
      });

      clearRefreshTokenCookie(res as unknown as Response, configService as unknown as ConfigService);

      const calls = res.clearCookie.mock.calls as unknown[][];
      const cookieOptions = calls[0][1] as Record<string, unknown>;
      expect(cookieOptions['secure']).toBe(true);
    });
  });
});
