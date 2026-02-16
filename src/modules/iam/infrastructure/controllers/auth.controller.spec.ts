import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { REGISTER_USE_CASE } from '../../application/ports/register.use-case';
import { LOGIN_USE_CASE } from '../../application/ports/login.use-case';
import { LOGOUT_USE_CASE } from '../../application/ports/logout.use-case';
import { REFRESH_TOKEN_USE_CASE } from '../../application/ports/refresh-token.use-case';
import { REQUEST_OTP_USE_CASE } from '../../application/ports/request-otp.use-case';
import { VERIFY_OTP_USE_CASE } from '../../application/ports/verify-otp.use-case';

describe('AuthController', () => {
  let controller: AuthController;
  let registerUseCase: { execute: jest.Mock };
  let loginUseCase: { execute: jest.Mock };
  let logoutUseCase: { execute: jest.Mock };
  let refreshTokenUseCase: { execute: jest.Mock };
  let requestOtpUseCase: { execute: jest.Mock };
  let verifyOtpUseCase: { execute: jest.Mock };
  let mockRes: Partial<Response>;
  let mockConfigService: Partial<ConfigService>;

  const authResult = {
    user: { id: '1', email: 'test@example.com' },
    accessToken: 'access-jwt',
    refreshToken: 'refresh-hex',
    expiresIn: 900,
    tokenType: 'Bearer',
  };

  function createMockReq(cookies: Record<string, string> = {}): Partial<Request> {
    return { cookies } as Partial<Request>;
  }

  beforeEach(async () => {
    registerUseCase = { execute: jest.fn() };
    loginUseCase = { execute: jest.fn() };
    logoutUseCase = { execute: jest.fn() };
    refreshTokenUseCase = { execute: jest.fn() };
    requestOtpUseCase = { execute: jest.fn() };
    verifyOtpUseCase = { execute: jest.fn() };
    mockRes = { cookie: jest.fn(), clearCookie: jest.fn() } as Partial<Response>;
    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        const config: Record<string, unknown> = {
          'cookie.domain': '',
          'cookie.secure': false,
          'cookie.sameSite': 'strict',
          'auth.jwt.refreshExpiration': 604800,
        };
        return config[key] ?? defaultValue;
      }),
    } as Partial<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: REGISTER_USE_CASE, useValue: registerUseCase },
        { provide: LOGIN_USE_CASE, useValue: loginUseCase },
        { provide: LOGOUT_USE_CASE, useValue: logoutUseCase },
        { provide: REFRESH_TOKEN_USE_CASE, useValue: refreshTokenUseCase },
        { provide: REQUEST_OTP_USE_CASE, useValue: requestOtpUseCase },
        { provide: VERIFY_OTP_USE_CASE, useValue: verifyOtpUseCase },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should set refresh cookie and return accessToken in body', async () => {
      registerUseCase.execute.mockResolvedValue(authResult);
      const dto = { email: 'test@example.com', password: 'StrongP@ss1', firstName: 'John', lastName: 'Doe' };

      const result = await controller.register(dto, mockRes as Response);

      expect(registerUseCase.execute).toHaveBeenCalledWith(dto);
      expect(mockRes.cookie).toHaveBeenCalledTimes(1);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-hex',
        expect.objectContaining({ httpOnly: true, path: '/api/auth/refresh' }),
      );
      expect(result).toEqual({
        user: authResult.user,
        accessToken: 'access-jwt',
        expiresIn: 900,
        tokenType: 'Bearer',
      });
      expect(result).not.toHaveProperty('refreshToken');
    });
  });

  describe('login', () => {
    it('should set refresh cookie and return accessToken in body', async () => {
      loginUseCase.execute.mockResolvedValue(authResult);
      const dto = { email: 'test@example.com', password: 'StrongP@ss1' };

      const result = await controller.login(dto, mockRes as Response);

      expect(loginUseCase.execute).toHaveBeenCalledWith(dto);
      expect(mockRes.cookie).toHaveBeenCalledTimes(1);
      expect(result.accessToken).toBe('access-jwt');
      expect(result).not.toHaveProperty('refreshToken');
    });
  });

  describe('logout', () => {
    it('should read refresh token from cookie first', async () => {
      logoutUseCase.execute.mockResolvedValue(undefined);
      const req = createMockReq({ refresh_token: 'cookie-token' });

      const result = await controller.logout({ refreshToken: 'body-token' }, req as Request, mockRes as Response);

      expect(logoutUseCase.execute).toHaveBeenCalledWith({ refreshToken: 'cookie-token' });
      expect(mockRes.clearCookie).toHaveBeenCalledTimes(1);
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.objectContaining({ path: '/api/auth/refresh' }),
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should fallback to body refreshToken when no cookie', async () => {
      logoutUseCase.execute.mockResolvedValue(undefined);
      const req = createMockReq();

      await controller.logout({ refreshToken: 'body-token' }, req as Request, mockRes as Response);

      expect(logoutUseCase.execute).toHaveBeenCalledWith({ refreshToken: 'body-token' });
    });

    it('should clear cookie and skip revoke when no token provided', async () => {
      const req = createMockReq();

      const result = await controller.logout({}, req as Request, mockRes as Response);

      expect(logoutUseCase.execute).not.toHaveBeenCalled();
      expect(mockRes.clearCookie).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('refresh', () => {
    it('should read refresh token from cookie first and return new accessToken in body', async () => {
      refreshTokenUseCase.execute.mockResolvedValue(authResult);
      const req = createMockReq({ refresh_token: 'cookie-token' });

      const result = await controller.refresh({}, req as Request, mockRes as Response);

      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith({ refreshToken: 'cookie-token' });
      expect(mockRes.cookie).toHaveBeenCalledTimes(1);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-hex',
        expect.objectContaining({ httpOnly: true, path: '/api/auth/refresh' }),
      );
      expect(result.accessToken).toBe('access-jwt');
      expect(result).not.toHaveProperty('refreshToken');
    });

    it('should fallback to body refreshToken when no cookie', async () => {
      refreshTokenUseCase.execute.mockResolvedValue(authResult);
      const req = createMockReq();

      await controller.refresh({ refreshToken: 'body-token' }, req as Request, mockRes as Response);

      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith({ refreshToken: 'body-token' });
    });
  });

  describe('requestOtp', () => {
    it('should call requestOtpUseCase and return message', async () => {
      const expectedResult = { message: 'If an account exists or can be created, an OTP has been sent' };
      requestOtpUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.requestOtp({ email: 'test@example.com' });

      expect(requestOtpUseCase.execute).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('verifyOtp', () => {
    it('should set refresh cookie and return accessToken in body', async () => {
      verifyOtpUseCase.execute.mockResolvedValue(authResult);

      const result = await controller.verifyOtp({ email: 'test@example.com', code: '123456' }, mockRes as Response);

      expect(verifyOtpUseCase.execute).toHaveBeenCalledWith({ email: 'test@example.com', code: '123456' });
      expect(mockRes.cookie).toHaveBeenCalledTimes(1);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-hex',
        expect.objectContaining({ httpOnly: true, path: '/api/auth/refresh' }),
      );
      expect(result).toEqual({
        user: authResult.user,
        accessToken: 'access-jwt',
        expiresIn: 900,
        tokenType: 'Bearer',
      });
      expect(result).not.toHaveProperty('refreshToken');
    });
  });
});
