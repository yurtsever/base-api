import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { OAuthCallbackDto } from '../dtos/oauth-callback.dto';
import type { OAuthStateRepositoryPort } from '../../domain/ports/oauth-state-repository.port';
import { OAUTH_STATE_REPOSITORY_PORT } from '../../domain/ports/oauth-state-repository.port';
import { InvalidOAuthStateException } from '../../domain/exceptions/invalid-oauth-state.exception';
import type { OAuthLoginUseCasePort } from '../ports/oauth-login.use-case';
import { assertAllowedRedirectUri } from '../utils/redirect-uri.validator';

@Injectable()
export class OAuthLoginUseCase implements OAuthLoginUseCasePort {
  constructor(
    private readonly authDomainService: AuthDomainService,
    private readonly configService: ConfigService,
    @Inject(OAUTH_STATE_REPOSITORY_PORT)
    private readonly oauthStateRepository: OAuthStateRepositoryPort,
  ) {}

  async execute(dto: OAuthCallbackDto) {
    assertAllowedRedirectUri(this.configService.get<string[]>('oauth.allowedRedirectUris', []), dto.redirectUri);

    // CSRF: the state must match one this server issued for this provider, unexpired
    // and not yet consumed (consume is atomic single-use).
    const storedState = await this.oauthStateRepository.consume(dto.state);
    if (!storedState || storedState.isExpired() || storedState.provider !== dto.provider) {
      throw new InvalidOAuthStateException();
    }

    const refreshExpiration = this.configService.get<number>('auth.jwt.refreshExpiration', 604800);

    const { user, tokens, isNewUser } = await this.authDomainService.loginWithOAuth(
      dto.provider,
      dto.code,
      dto.redirectUri,
      refreshExpiration,
    );

    return {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: 'Bearer',
      isNewUser,
    };
  }
}
