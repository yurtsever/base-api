import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import type { RefreshTokenUseCasePort } from '../ports/refresh-token.use-case';

@Injectable()
export class RefreshTokenUseCase implements RefreshTokenUseCasePort {
  constructor(
    private readonly authDomainService: AuthDomainService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: RefreshTokenDto) {
    if (!dto.refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    const refreshExpiration = this.configService.get<number>('auth.jwt.refreshExpiration', 604800);
    const { user, tokens } = await this.authDomainService.refreshTokens(dto.refreshToken, refreshExpiration);

    return {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: 'Bearer',
    };
  }
}
