import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RequestOtpUseCase } from './request-otp.use-case';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { EmailService } from '../../../email/infrastructure/services/email.service';

describe('RequestOtpUseCase', () => {
  let useCase: RequestOtpUseCase;
  let authDomainService: { requestOtp: jest.Mock };
  let emailService: { sendFromTemplate: jest.Mock };
  let configService: Partial<ConfigService>;

  beforeEach(async () => {
    authDomainService = { requestOtp: jest.fn() };
    emailService = { sendFromTemplate: jest.fn() };
    configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        const config: Record<string, unknown> = {
          'otp.expiration': 300,
          'otp.resendInterval': 60,
        };
        return config[key] ?? defaultValue;
      }),
    } as Partial<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestOtpUseCase,
        { provide: AuthDomainService, useValue: authDomainService },
        { provide: EmailService, useValue: emailService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    useCase = module.get<RequestOtpUseCase>(RequestOtpUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should request OTP and send email', async () => {
    authDomainService.requestOtp.mockResolvedValue('123456');
    emailService.sendFromTemplate.mockResolvedValue(undefined);

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(authDomainService.requestOtp).toHaveBeenCalledWith('test@example.com', 300, 60);
    expect(emailService.sendFromTemplate).toHaveBeenCalledWith('test@example.com', 'Your login code', 'otp', {
      code: '123456',
      expiresMinutes: 5,
    });
    expect(result).toEqual({ message: 'If an account exists or can be created, an OTP has been sent' });
  });

  it('should propagate domain service errors', async () => {
    authDomainService.requestOtp.mockRejectedValue(new Error('Rate limited'));

    await expect(useCase.execute({ email: 'test@example.com' })).rejects.toThrow('Rate limited');
  });
});
