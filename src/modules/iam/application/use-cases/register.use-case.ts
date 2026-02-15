import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { RegisterDto } from '../dtos/register.dto';
import type { RegisterUseCasePort } from '../ports/register.use-case';

@Injectable()
export class RegisterUseCase implements RegisterUseCasePort {
  constructor(
    private readonly authDomainService: AuthDomainService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: RegisterDto) {
    const user = await this.authDomainService.register(dto.email, dto.password, dto.firstName, dto.lastName);

    const refreshExpiration = this.configService.get<number>('auth.jwt.refreshExpiration', 604800);
    const { tokens } = await this.authDomainService.login(dto.email, dto.password, refreshExpiration);

    return {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: 'Bearer',
    };
  }
}
