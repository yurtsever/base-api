import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OAuthLoginUseCase } from '../oauth-login.use-case';
import { AuthDomainService } from '../../../domain/services/auth-domain.service';
import { User } from '../../../domain/models/user.model';
import { Email } from '../../../domain/value-objects/email.value-object';
import { Role } from '../../../domain/models/role.model';
import { InvalidRedirectUriException } from '../../../domain/exceptions/invalid-redirect-uri.exception';
import { InvalidOAuthStateException } from '../../../domain/exceptions/invalid-oauth-state.exception';
import { OAUTH_STATE_REPOSITORY_PORT } from '../../../domain/ports/oauth-state-repository.port';
import { OAuthState } from '../../../domain/models/oauth-state.model';

describe('OAuthLoginUseCase', () => {
  let useCase: OAuthLoginUseCase;
  let authDomainService: { loginWithOAuth: jest.Mock };
  let configService: { get: jest.Mock };
  let oauthStateRepository: { save: jest.Mock; consume: jest.Mock; deleteExpired: jest.Mock };

  const mockUser = new User('user-id', Email.create('user@gmail.com'), null, 'John', 'Doe', true, [
    new Role('role-1', 'user', 'Default', true, []),
  ]);

  // A valid, unexpired state bound to the google provider
  const validGoogleState = () =>
    new OAuthState('state-id', 'valid-state', 'google', new Date(Date.now() + 600000));

  beforeEach(async () => {
    authDomainService = {
      loginWithOAuth: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'oauth.allowedRedirectUris') return ['http://localhost:3000/callback'];
        return 604800;
      }),
    };
    oauthStateRepository = {
      save: jest.fn(),
      consume: jest.fn().mockResolvedValue(validGoogleState()),
      deleteExpired: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthLoginUseCase,
        { provide: AuthDomainService, useValue: authDomainService },
        { provide: ConfigService, useValue: configService },
        { provide: OAUTH_STATE_REPOSITORY_PORT, useValue: oauthStateRepository },
      ],
    }).compile();

    useCase = module.get<OAuthLoginUseCase>(OAuthLoginUseCase);
  });

  it('should verify state, call authDomainService.loginWithOAuth and return AuthResponse', async () => {
    authDomainService.loginWithOAuth.mockResolvedValue({
      user: mockUser,
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token', expiresIn: 900 },
      isNewUser: false,
    });

    const result = await useCase.execute({
      provider: 'google',
      code: 'auth-code',
      redirectUri: 'http://localhost:3000/callback',
      state: 'valid-state',
    });

    expect(oauthStateRepository.consume).toHaveBeenCalledWith('valid-state');
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
      provider: 'google',
      code: 'auth-code',
      redirectUri: 'http://localhost:3000/callback',
      state: 'valid-state',
    });

    expect(result.isNewUser).toBe(true);
  });

  it('should reject a redirect URI not on the allowlist before calling the domain service', async () => {
    await expect(
      useCase.execute({
        provider: 'google',
        code: 'auth-code',
        redirectUri: 'http://evil.example.com/callback',
        state: 'valid-state',
      }),
    ).rejects.toThrow(InvalidRedirectUriException);
    expect(authDomainService.loginWithOAuth).not.toHaveBeenCalled();
  });

  it('should reject when the state is unknown/already consumed (CSRF)', async () => {
    oauthStateRepository.consume.mockResolvedValue(null);

    await expect(
      useCase.execute({
        provider: 'google',
        code: 'auth-code',
        redirectUri: 'http://localhost:3000/callback',
        state: 'forged-state',
      }),
    ).rejects.toThrow(InvalidOAuthStateException);
    expect(authDomainService.loginWithOAuth).not.toHaveBeenCalled();
  });

  it('should reject when the state was issued for a different provider', async () => {
    oauthStateRepository.consume.mockResolvedValue(validGoogleState());

    await expect(
      useCase.execute({
        provider: 'github',
        code: 'auth-code',
        redirectUri: 'http://localhost:3000/callback',
        state: 'valid-state',
      }),
    ).rejects.toThrow(InvalidOAuthStateException);
    expect(authDomainService.loginWithOAuth).not.toHaveBeenCalled();
  });
});
