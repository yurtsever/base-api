import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { VerifyOtpUseCase } from './verify-otp.use-case';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { User } from '../../domain/models/user.model';
import { Email } from '../../domain/value-objects/email.value-object';
import { Role } from '../../domain/models/role.model';

describe('VerifyOtpUseCase', () => {
  let useCase: VerifyOtpUseCase;
  let authDomainService: { verifyOtpAndLogin: jest.Mock };
  let configService: Partial<ConfigService>;

  const mockUser = new User('user-id', Email.create('test@example.com'), null, '', '', true, [
    new Role('role-1', 'user', 'Default', true, []),
  ]);

  beforeEach(async () => {
    authDomainService = { verifyOtpAndLogin: jest.fn() };
    configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        const config: Record<string, unknown> = {
          'otp.maxAttempts': 5,
          'auth.jwt.refreshExpiration': 604800,
        };
        return config[key] ?? defaultValue;
      }),
    } as Partial<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyOtpUseCase,
        { provide: AuthDomainService, useValue: authDomainService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    useCase = module.get<VerifyOtpUseCase>(VerifyOtpUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should verify OTP and return auth response', async () => {
    authDomainService.verifyOtpAndLogin.mockResolvedValue({
      user: mockUser,
      tokens: { accessToken: 'access-jwt', refreshToken: 'refresh-hex', expiresIn: 900 },
      isNewUser: true,
    });

    const result = await useCase.execute({ email: 'test@example.com', code: '123456' });

    expect(authDomainService.verifyOtpAndLogin).toHaveBeenCalledWith('test@example.com', '123456', 5, 604800);
    expect(result).toEqual({
      user: mockUser.toJSON(),
      accessToken: 'access-jwt',
      refreshToken: 'refresh-hex',
      expiresIn: 900,
      tokenType: 'Bearer',
    });
  });

  it('should propagate domain service errors', async () => {
    authDomainService.verifyOtpAndLogin.mockRejectedValue(new Error('Invalid code'));

    await expect(useCase.execute({ email: 'test@example.com', code: '000000' })).rejects.toThrow('Invalid code');
  });
});
