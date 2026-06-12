import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { USER_REPOSITORY_PORT } from '../../domain/ports/user-repository.port';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  scopes?: string[];
  isApiKey?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
  ) {
    // Read and validate the secret BEFORE calling super(). There is no insecure fallback:
    // a missing/empty secret must fail loudly at startup rather than booting with a known key.
    const secret = configService.get<string>('auth.jwt.secret');
    if (!secret) {
      throw new Error('JWT secret is not configured. Set a strong JWT_SECRET (>= 32 chars).');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Validate the token against the *current* user state, not just the signed payload.
   * A deactivated or deleted user's still-unexpired token must stop working immediately.
   *
   * NOTE: this adds one DB read per authenticated request. For instant hard-revocation of
   * individual tokens (e.g. on logout-all), a `tokenVersion`/jti denylist would be a stronger
   * future enhancement — it requires a migration and is out of scope here.
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User is no longer active');
    }

    // Refresh roles from the loaded user so RBAC reflects current state, not stale claims.
    return { sub: user.id, email: user.email.value, roles: user.roles.map((r) => r.name) };
  }
}
