import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { LinkOAuthAccountDto } from '../dtos/link-oauth-account.dto';
import type { OAuthStateRepositoryPort } from '../../domain/ports/oauth-state-repository.port';
import { OAUTH_STATE_REPOSITORY_PORT } from '../../domain/ports/oauth-state-repository.port';
import { InvalidOAuthStateException } from '../../domain/exceptions/invalid-oauth-state.exception';
import type { LinkOAuthAccountUseCasePort, LinkedOAuthAccount } from '../ports/link-oauth-account.use-case';
import { assertAllowedRedirectUri } from '../utils/redirect-uri.validator';

@Injectable()
export class LinkOAuthAccountUseCase implements LinkOAuthAccountUseCasePort {
  constructor(
    private readonly authDomainService: AuthDomainService,
    private readonly configService: ConfigService,
    @Inject(OAUTH_STATE_REPOSITORY_PORT)
    private readonly oauthStateRepository: OAuthStateRepositoryPort,
  ) {}

  async execute(userId: string, dto: LinkOAuthAccountDto): Promise<LinkedOAuthAccount> {
    assertAllowedRedirectUri(this.configService.get<string[]>('oauth.allowedRedirectUris', []), dto.redirectUri);

    // The state must match one this server issued for THIS user and provider, unexpired,
    // and not yet consumed. The userId binding is what prevents link-CSRF: an attacker
    // cannot get a logged-in victim to redeem a state the attacker initiated.
    const storedState = await this.oauthStateRepository.consume(dto.state);
    if (
      !storedState ||
      storedState.isExpired() ||
      storedState.provider !== dto.provider ||
      storedState.userId !== userId
    ) {
      throw new InvalidOAuthStateException();
    }

    const account = await this.authDomainService.linkOAuthAccount(userId, dto.provider, dto.code, dto.redirectUri);

    return {
      provider: account.provider,
      providerUserId: account.providerUserId,
      email: account.email,
    };
  }
}
