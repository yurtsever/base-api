import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { User } from '../../domain/models/user.model';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  const mockUser = new User(
    'user-id',
    Email.create('test@example.com'),
    Password.createFromHash('hash'),
    'John',
    'Doe',
    true,
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: AuthDomainService,
          useValue: {
            refreshTokens: jest.fn().mockResolvedValue({
              user: mockUser,
              tokens: { accessToken: 'new-access', refreshToken: 'new-refresh', expiresIn: 900 },
            }),
          },
        },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(604800) } },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
  });

  it('should refresh tokens', async () => {
    const result = await useCase.execute({ refreshToken: 'old-refresh' });

    expect(result.accessToken).toBe('new-access');
    expect(result.refreshToken).toBe('new-refresh');
    expect(result.tokenType).toBe('Bearer');
  });
});
