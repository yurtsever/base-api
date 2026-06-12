import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GetOAuthUrlUseCase } from '../get-oauth-url.use-case';
import { InvalidRedirectUriException } from '../../../domain/exceptions/invalid-redirect-uri.exception';
import { OAUTH_STATE_REPOSITORY_PORT } from '../../../domain/ports/oauth-state-repository.port';
import { OAuthState } from '../../../domain/models/oauth-state.model';

describe('GetOAuthUrlUseCase', () => {
  let useCase: GetOAuthUrlUseCase;
  let configService: { get: jest.Mock };
  let oauthStateRepository: { save: jest.Mock; consume: jest.Mock; deleteExpired: jest.Mock };

  beforeEach(async () => {
    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, unknown> = {
          'oauth.google.clientId': 'google-client-id',
          'oauth.github.clientId': 'github-client-id',
          'oauth.allowedRedirectUris': ['http://localhost:3000/callback'],
          'oauth.stateExpiration': 600,
        };
        return config[key] ?? '';
      }),
    };
    oauthStateRepository = { save: jest.fn(), consume: jest.fn(), deleteExpired: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOAuthUrlUseCase,
        { provide: ConfigService, useValue: configService },
        { provide: OAUTH_STATE_REPOSITORY_PORT, useValue: oauthStateRepository },
      ],
    }).compile();

    useCase = module.get<GetOAuthUrlUseCase>(GetOAuthUrlUseCase);
  });

  describe('Google', () => {
    it('should return Google authorization URL and persist the state', async () => {
      const result = await useCase.execute('google', 'http://localhost:3000/callback');

      expect(result.url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(result.url).toContain('client_id=google-client-id');
      expect(result.url).toContain('redirect_uri=');
      expect(result.url).toContain('response_type=code');
      expect(result.url).toContain('scope=openid+email+profile');
      expect(result.url).toContain(`state=${result.state}`);
      expect(result.state).toBeTruthy();
      expect(result.state.length).toBe(64); // 32 bytes hex

      // State persisted server-side, bound to the provider, for callback verification
      expect(oauthStateRepository.save).toHaveBeenCalledTimes(1);
      const saved = oauthStateRepository.save.mock.calls[0][0] as OAuthState;
      expect(saved.state).toBe(result.state);
      expect(saved.provider).toBe('google');
    });
  });

  describe('GitHub', () => {
    it('should return GitHub authorization URL and persist the state', async () => {
      const result = await useCase.execute('github', 'http://localhost:3000/callback');

      expect(result.url).toContain('https://github.com/login/oauth/authorize');
      expect(result.url).toContain('client_id=github-client-id');
      expect(result.url).toContain('redirect_uri=');
      expect(result.url).toContain('scope=read%3Auser+user%3Aemail');
      expect(result.url).toContain(`state=${result.state}`);
      expect(result.state).toBeTruthy();
      expect(oauthStateRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('Invalid provider', () => {
    it('should throw for unsupported provider', async () => {
      await expect(useCase.execute('facebook', 'http://localhost:3000/callback')).rejects.toThrow(
        'Unsupported OAuth provider',
      );
    });
  });

  describe('Redirect URI allowlist', () => {
    it('should reject a redirect URI not on the allowlist without persisting state', async () => {
      await expect(useCase.execute('google', 'http://evil.example.com/callback')).rejects.toThrow(
        InvalidRedirectUriException,
      );
      expect(oauthStateRepository.save).not.toHaveBeenCalled();
    });
  });
});
