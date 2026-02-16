import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import type { VerifyOtpUseCasePort } from '../ports/verify-otp.use-case';

@Injectable()
export class VerifyOtpUseCase implements VerifyOtpUseCasePort {
  constructor(
    private readonly authDomainService: AuthDomainService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: VerifyOtpDto) {
    const maxAttempts = this.configService.get<number>('otp.maxAttempts', 5);
    const refreshExpiration = this.configService.get<number>('auth.jwt.refreshExpiration', 604800);

    const { user, tokens } = await this.authDomainService.verifyOtpAndLogin(
      dto.email,
      dto.code,
      maxAttempts,
      refreshExpiration,
    );

    return {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: 'Bearer',
    };
  }
}
