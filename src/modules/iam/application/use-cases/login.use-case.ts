import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { LoginDto } from '../dtos/login.dto';
import type { LoginUseCasePort } from '../ports/login.use-case';

@Injectable()
export class LoginUseCase implements LoginUseCasePort {
  constructor(
    private readonly authDomainService: AuthDomainService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: LoginDto) {
    const refreshExpiration = this.configService.get<number>('auth.jwt.refreshExpiration', 604800);
    const { user, tokens } = await this.authDomainService.login(dto.email, dto.password, refreshExpiration);

    return {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: 'Bearer',
    };
  }
}
