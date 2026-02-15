import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoginUseCase } from './login.use-case';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { User } from '../../domain/models/user.model';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

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
        LoginUseCase,
        {
          provide: AuthDomainService,
          useValue: {
            login: jest.fn().mockResolvedValue({
              user: mockUser,
              tokens: { accessToken: 'access', refreshToken: 'refresh', expiresIn: 900 },
            }),
          },
        },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(604800) } },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should login and return tokens', async () => {
    const result = await useCase.execute({ email: 'test@example.com', password: 'StrongP@ss1' });

    expect(result.user).toBeDefined();
    expect(result.accessToken).toBe('access');
    expect(result.tokenType).toBe('Bearer');
  });
});
