import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GetOAuthUrlUseCase } from './get-oauth-url.use-case';

describe('GetOAuthUrlUseCase', () => {
  let useCase: GetOAuthUrlUseCase;
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          'oauth.google.clientId': 'google-client-id',
          'oauth.github.clientId': 'github-client-id',
        };
        return config[key] || '';
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetOAuthUrlUseCase, { provide: ConfigService, useValue: configService }],
    }).compile();

    useCase = module.get<GetOAuthUrlUseCase>(GetOAuthUrlUseCase);
  });

  describe('Google', () => {
    it('should return Google authorization URL', () => {
      const result = useCase.execute('google', 'http://localhost:3000/callback');

      expect(result.url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(result.url).toContain('client_id=google-client-id');
      expect(result.url).toContain('redirect_uri=');
      expect(result.url).toContain('response_type=code');
      expect(result.url).toContain('scope=openid+email+profile');
      expect(result.url).toContain(`state=${result.state}`);
      expect(result.state).toBeTruthy();
      expect(result.state.length).toBe(64); // 32 bytes hex
    });
  });

  describe('GitHub', () => {
    it('should return GitHub authorization URL', () => {
      const result = useCase.execute('github', 'http://localhost:3000/callback');

      expect(result.url).toContain('https://github.com/login/oauth/authorize');
      expect(result.url).toContain('client_id=github-client-id');
      expect(result.url).toContain('redirect_uri=');
      expect(result.url).toContain('scope=read%3Auser+user%3Aemail');
      expect(result.url).toContain(`state=${result.state}`);
      expect(result.state).toBeTruthy();
    });
  });

  describe('Invalid provider', () => {
    it('should throw for unsupported provider', () => {
      expect(() => useCase.execute('facebook', 'http://localhost:3000/callback')).toThrow('Unsupported OAuth provider');
    });
  });
});
