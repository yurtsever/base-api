import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { UserRepositoryPort } from '../ports/user-repository.port';
import { USER_REPOSITORY_PORT } from '../ports/user-repository.port';
import type { RefreshTokenRepositoryPort } from '../ports/refresh-token-repository.port';
import { REFRESH_TOKEN_REPOSITORY_PORT } from '../ports/refresh-token-repository.port';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import { PASSWORD_HASHER_PORT } from '../ports/password-hasher.port';
import type { TokenGeneratorPort, TokenPair } from '../ports/token-generator.port';
import { TOKEN_GENERATOR_PORT } from '../ports/token-generator.port';
import type { RoleRepositoryPort } from '../ports/role-repository.port';
import { ROLE_REPOSITORY_PORT } from '../ports/role-repository.port';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refresh-token.model';
import { Email } from '../value-objects/email.value-object';
import { Password } from '../value-objects/password.value-object';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';
import { TokenExpiredException } from '../exceptions/token-expired.exception';

@Injectable()
export class AuthDomainService {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
    @Inject(REFRESH_TOKEN_REPOSITORY_PORT)
    private readonly refreshTokenRepository: RefreshTokenRepositoryPort,
    @Inject(PASSWORD_HASHER_PORT)
    private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_GENERATOR_PORT)
    private readonly tokenGenerator: TokenGeneratorPort,
    @Inject(ROLE_REPOSITORY_PORT)
    private readonly roleRepository: RoleRepositoryPort,
  ) {}

  async register(email: string, password: string, firstName: string, lastName: string): Promise<User> {
    const emailVO = Email.create(email);
    Password.createFromPlaintext(password); // validates strength

    const existingUser = await this.userRepository.findByEmail(emailVO.value);
    if (existingUser) {
      throw new UserAlreadyExistsException(emailVO.value);
    }

    const hashedPassword = await this.passwordHasher.hash(password);
    const passwordVO = Password.createFromHash(hashedPassword);

    const defaultRole = await this.roleRepository.findDefault();
    const roles = defaultRole ? [defaultRole] : [];

    const user = new User(randomUUID(), emailVO, passwordVO, firstName, lastName, true, roles);

    return this.userRepository.save(user);
  }

  async login(
    email: string,
    password: string,
    refreshExpirationSeconds: number,
  ): Promise<{ user: User; tokens: TokenPair }> {
    const user = await this.userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (!user.isActive) {
      throw new InvalidCredentialsException('Account is deactivated');
    }

    const isPasswordValid = await this.passwordHasher.compare(password, user.password.value);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const tokens = await this.tokenGenerator.generateTokenPair({
      sub: user.id,
      email: user.email.value,
      roles: user.roles.map((r) => r.name),
    });

    const refreshToken = new RefreshToken(
      randomUUID(),
      tokens.refreshToken,
      user.id,
      new Date(Date.now() + refreshExpirationSeconds * 1000),
      false,
    );

    await this.refreshTokenRepository.save(refreshToken);

    return { user, tokens };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.revokeByToken(refreshToken);
  }

  async refreshTokens(
    refreshTokenValue: string,
    refreshExpirationSeconds: number,
  ): Promise<{ user: User; tokens: TokenPair }> {
    const storedToken = await this.refreshTokenRepository.findByToken(refreshTokenValue);
    if (!storedToken || !storedToken.isValid()) {
      throw new TokenExpiredException('Refresh token is invalid or expired');
    }

    const user = await this.userRepository.findById(storedToken.userId);
    if (!user || !user.isActive) {
      throw new InvalidCredentialsException('Account is deactivated');
    }

    const tokens = await this.tokenGenerator.generateTokenPair({
      sub: user.id,
      email: user.email.value,
      roles: user.roles.map((r) => r.name),
    });

    const newRefreshToken = new RefreshToken(
      randomUUID(),
      tokens.refreshToken,
      user.id,
      new Date(Date.now() + refreshExpirationSeconds * 1000),
      false,
    );

    // Atomically revoke old token and save new one in a single transaction
    await this.refreshTokenRepository.rotateToken(refreshTokenValue, newRefreshToken);

    return { user, tokens };
  }
}
