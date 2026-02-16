import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { OAuthProvider } from '../../domain/value-objects/oauth-provider.value-object';
import type { GetOAuthUrlUseCasePort } from '../ports/get-oauth-url.use-case';

@Injectable()
export class GetOAuthUrlUseCase implements GetOAuthUrlUseCasePort {
  constructor(private readonly configService: ConfigService) {}

  execute(provider: string, redirectUri: string): { url: string; state: string } {
    const providerVO = OAuthProvider.create(provider);
    const state = randomBytes(32).toString('hex');

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
