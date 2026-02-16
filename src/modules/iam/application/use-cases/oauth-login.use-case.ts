import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { OAuthCallbackDto } from '../dtos/oauth-callback.dto';
import type { OAuthLoginUseCasePort } from '../ports/oauth-login.use-case';

@Injectable()
export class OAuthLoginUseCase implements OAuthLoginUseCasePort {
  constructor(
    private readonly authDomainService: AuthDomainService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: OAuthCallbackDto) {
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
