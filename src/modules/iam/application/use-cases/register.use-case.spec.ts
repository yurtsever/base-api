import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RegisterUseCase } from './register.use-case';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { User } from '../../domain/models/user.model';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let authDomainService: jest.Mocked<Partial<AuthDomainService>>;

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
    authDomainService = {
      register: jest.fn().mockResolvedValue(mockUser),
      login: jest.fn().mockResolvedValue({
        user: mockUser,
        tokens: { accessToken: 'access', refreshToken: 'refresh', expiresIn: 900 },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        { provide: AuthDomainService, useValue: authDomainService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(604800) } },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
  });

  it('should register and auto-login', async () => {
    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'StrongP@ss1',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(result.user).toBeDefined();
    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBe('refresh');
    expect(result.tokenType).toBe('Bearer');
    expect(authDomainService.register).toHaveBeenCalled();
    expect(authDomainService.login).toHaveBeenCalled();
  });
});
