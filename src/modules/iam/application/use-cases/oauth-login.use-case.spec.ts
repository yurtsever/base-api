import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OAuthLoginUseCase } from './oauth-login.use-case';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { User } from '../../domain/models/user.model';
import { Email } from '../../domain/value-objects/email.value-object';
import { Role } from '../../domain/models/role.model';

describe('OAuthLoginUseCase', () => {
  let useCase: OAuthLoginUseCase;
  let authDomainService: { loginWithOAuth: jest.Mock };
  let configService: { get: jest.Mock };

  const mockUser = new User('user-id', Email.create('user@gmail.com'), null, 'John', 'Doe', true, [
    new Role('role-1', 'user', 'Default', true, []),
  ]);

  beforeEach(async () => {
    authDomainService = {
      loginWithOAuth: jest.fn(),
    };
    configService = {
      get: jest.fn().mockReturnValue(604800),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthLoginUseCase,
        { provide: AuthDomainService, useValue: authDomainService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    useCase = module.get<OAuthLoginUseCase>(OAuthLoginUseCase);
  });

  it('should call authDomainService.loginWithOAuth and return AuthResponse', async () => {
    authDomainService.loginWithOAuth.mockResolvedValue({
      user: mockUser,
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token', expiresIn: 900 },
      isNewUser: false,
    });

    const result = await useCase.execute({
      provider: 'google',
      code: 'auth-code',
      redirectUri: 'http://localhost:3000/callback',
    });

    expect(authDomainService.loginWithOAuth).toHaveBeenCalledWith(
      'google',
      'auth-code',
      'http://localhost:3000/callback',
      604800,
    );
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.tokenType).toBe('Bearer');
    expect(result.isNewUser).toBe(false);
    expect(result.user.email).toBe('user@gmail.com');
  });

  it('should return isNewUser true for new users', async () => {
    authDomainService.loginWithOAuth.mockResolvedValue({
      user: mockUser,
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token', expiresIn: 900 },
      isNewUser: true,
    });

    const result = await useCase.execute({
      provider: 'github',
      code: 'auth-code',
      redirectUri: 'http://localhost:3000/callback',
    });

    expect(result.isNewUser).toBe(true);
  });
});
