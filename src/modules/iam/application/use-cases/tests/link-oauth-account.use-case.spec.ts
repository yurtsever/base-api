import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LinkOAuthAccountUseCase } from '../link-oauth-account.use-case';
import { AuthDomainService } from '../../../domain/services/auth-domain.service';
import { OAUTH_STATE_REPOSITORY_PORT } from '../../../domain/ports/oauth-state-repository.port';
import { OAuthState } from '../../../domain/models/oauth-state.model';
import { OAuthAccount } from '../../../domain/models/oauth-account.model';
import { InvalidOAuthStateException } from '../../../domain/exceptions/invalid-oauth-state.exception';
import { InvalidRedirectUriException } from '../../../domain/exceptions/invalid-redirect-uri.exception';

describe('LinkOAuthAccountUseCase', () => {
  let useCase: LinkOAuthAccountUseCase;
  let authDomainService: { linkOAuthAccount: jest.Mock };
  let configService: { get: jest.Mock };
  let oauthStateRepository: { save: jest.Mock; consume: jest.Mock; deleteExpired: jest.Mock };

  const dto = (overrides = {}) => ({
    provider: 'google',
    code: 'auth-code',
    redirectUri: 'http://localhost:3000/callback',
    state: 'valid-state',
    ...overrides,
  });

  // A state bound to user-id for the google provider
  const stateForUser = (userId: string) =>
    new OAuthState('state-id', 'valid-state', 'google', userId, new Date(Date.now() + 600000));

  beforeEach(async () => {
    authDomainService = { linkOAuthAccount: jest.fn() };
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'oauth.allowedRedirectUris') return ['http://localhost:3000/callback'];
        return 604800;
      }),
    };
    oauthStateRepository = {
      save: jest.fn(),
      consume: jest.fn().mockResolvedValue(stateForUser('user-id')),
      deleteExpired: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkOAuthAccountUseCase,
        { provide: AuthDomainService, useValue: authDomainService },
        { provide: ConfigService, useValue: configService },
        { provide: OAUTH_STATE_REPOSITORY_PORT, useValue: oauthStateRepository },
      ],
    }).compile();

    useCase = module.get<LinkOAuthAccountUseCase>(LinkOAuthAccountUseCase);
  });

  it('should verify the user-bound state and link the account', async () => {
    authDomainService.linkOAuthAccount.mockResolvedValue(
      new OAuthAccount('acc-1', 'user-id', 'google', 'goog-123', 'user@gmail.com'),
    );

    const result = await useCase.execute('user-id', dto());

    expect(oauthStateRepository.consume).toHaveBeenCalledWith('valid-state');
    expect(authDomainService.linkOAuthAccount).toHaveBeenCalledWith(
      'user-id',
      'google',
      'auth-code',
      'http://localhost:3000/callback',
    );
    expect(result).toEqual({ provider: 'google', providerUserId: 'goog-123', email: 'user@gmail.com' });
  });

  it('should reject when the state belongs to a different user (link-CSRF)', async () => {
    // State was issued for the attacker, but the victim (user-id) is the one redeeming it.
    oauthStateRepository.consume.mockResolvedValue(stateForUser('attacker-id'));

    await expect(useCase.execute('user-id', dto())).rejects.toThrow(InvalidOAuthStateException);
    expect(authDomainService.linkOAuthAccount).not.toHaveBeenCalled();
  });

  it('should reject an unknown/already-consumed state', async () => {
    oauthStateRepository.consume.mockResolvedValue(null);

    await expect(useCase.execute('user-id', dto())).rejects.toThrow(InvalidOAuthStateException);
    expect(authDomainService.linkOAuthAccount).not.toHaveBeenCalled();
  });

  it('should reject when the state was issued for a different provider', async () => {
    await expect(useCase.execute('user-id', dto({ provider: 'github' }))).rejects.toThrow(InvalidOAuthStateException);
    expect(authDomainService.linkOAuthAccount).not.toHaveBeenCalled();
  });

  it('should reject a redirect URI not on the allowlist before consuming state', async () => {
    await expect(useCase.execute('user-id', dto({ redirectUri: 'http://evil.example.com/callback' }))).rejects.toThrow(
      InvalidRedirectUriException,
    );
    expect(oauthStateRepository.consume).not.toHaveBeenCalled();
    expect(authDomainService.linkOAuthAccount).not.toHaveBeenCalled();
  });
});
