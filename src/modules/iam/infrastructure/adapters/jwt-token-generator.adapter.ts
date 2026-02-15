import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import type { TokenGeneratorPort, TokenPair, AccessTokenPayload } from '../../domain/ports/token-generator.port';

@Injectable()
export class JwtTokenGeneratorAdapter implements TokenGeneratorPort {
  private readonly accessExpiration: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessExpiration = this.configService.get<number>('auth.jwt.accessExpiration', 900);
  }

  async generateTokenPair(payload: AccessTokenPayload): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(
      { sub: payload.sub, email: payload.email, roles: payload.roles },
      { expiresIn: this.accessExpiration },
    );

    const refreshToken = this.generateRefreshToken();

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpiration,
    };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
    return {
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
  }

  generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }
}
