import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, randomUUID } from 'crypto';
import { OAuthProvider } from '../../domain/value-objects/oauth-provider.value-object';
import { OAuthState } from '../../domain/models/oauth-state.model';
import type { OAuthStateRepositoryPort } from '../../domain/ports/oauth-state-repository.port';
import { OAUTH_STATE_REPOSITORY_PORT } from '../../domain/ports/oauth-state-repository.port';
import type { GetOAuthUrlUseCasePort } from '../ports/get-oauth-url.use-case';
import { assertAllowedRedirectUri } from '../utils/redirect-uri.validator';

@Injectable()
export class GetOAuthUrlUseCase implements GetOAuthUrlUseCasePort {
  constructor(
    private readonly configService: ConfigService,
    @Inject(OAUTH_STATE_REPOSITORY_PORT)
    private readonly oauthStateRepository: OAuthStateRepositoryPort,
  ) {}

  async execute(provider: string, redirectUri: string): Promise<{ url: string; state: string }> {
    const providerVO = OAuthProvider.create(provider);
    assertAllowedRedirectUri(this.configService.get<string[]>('oauth.allowedRedirectUris', []), redirectUri);

    const state = randomBytes(32).toString('hex');

    // Persist the state server-side so the callback can verify it (CSRF defense).
    const ttlSeconds = this.configService.get<number>('oauth.stateExpiration', 600);
    await this.oauthStateRepository.save(
      new OAuthState(randomUUID(), state, providerVO.value, new Date(Date.now() + ttlSeconds * 1000)),
    );

    switch (providerVO.value) {
      case 'google':
        return { url: this.buildGoogleUrl(redirectUri, state), state };
      case 'github':
        return { url: this.buildGitHubUrl(redirectUri, state), state };
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  private buildGoogleUrl(redirectUri: string, state: string): string {
    const clientId = this.configService.get<string>('oauth.google.clientId');
    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  private buildGitHubUrl(redirectUri: string, state: string): string {
    const clientId = this.configService.get<string>('oauth.github.clientId');
    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      scope: 'read:user user:email',
      state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }
}
