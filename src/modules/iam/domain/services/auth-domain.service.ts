import { Inject, Injectable } from '@nestjs/common';
import { randomInt, randomUUID, timingSafeEqual } from 'crypto';
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
import type { OtpRepositoryPort } from '../ports/otp-repository.port';
import { OTP_REPOSITORY_PORT } from '../ports/otp-repository.port';
import type { OAuthAccountRepositoryPort } from '../ports/oauth-account-repository.port';
import { OAUTH_ACCOUNT_REPOSITORY_PORT } from '../ports/oauth-account-repository.port';
import type { OAuthProviderPort } from '../ports/oauth-provider.port';
import { OAUTH_PROVIDER_PORT } from '../ports/oauth-provider.port';
import { User } from '../models/user.model';
import { Otp } from '../models/otp.model';
import { OAuthAccount } from '../models/oauth-account.model';
import { RefreshToken } from '../models/refresh-token.model';
import { Email } from '../value-objects/email.value-object';
import { Password } from '../value-objects/password.value-object';
import { OAuthProvider } from '../value-objects/oauth-provider.value-object';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';
import { TokenExpiredException } from '../exceptions/token-expired.exception';
import { InvalidOtpException } from '../exceptions/invalid-otp.exception';
import { OAuthException } from '../exceptions/oauth.exception';

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
    @Inject(OTP_REPOSITORY_PORT)
    private readonly otpRepository: OtpRepositoryPort,
    @Inject(OAUTH_ACCOUNT_REPOSITORY_PORT)
    private readonly oauthAccountRepository: OAuthAccountRepositoryPort,
    @Inject(OAUTH_PROVIDER_PORT)
    private readonly oauthProvider: OAuthProviderPort,
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

    if (!user.hasPassword()) {
      throw new InvalidCredentialsException('Password login not available for this account');
    }

    const isPasswordValid = await this.passwordHasher.compare(password, user.password!.value);
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

  async requestOtp(email: string, expirationSeconds: number, resendIntervalSeconds: number): Promise<string> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check resend interval — reject if last OTP was sent too recently
    const latestOtp = await this.otpRepository.findLatestByEmail(normalizedEmail);
    if (latestOtp && latestOtp.createdAt) {
      const elapsed = (Date.now() - latestOtp.createdAt.getTime()) / 1000;
      if (elapsed < resendIntervalSeconds) {
        throw new InvalidOtpException('Please wait before requesting a new code');
      }
    }

    // Invalidate previous OTPs
    await this.otpRepository.invalidateAllByEmail(normalizedEmail);

    // Generate 6-digit code
    const code = String(randomInt(100000, 999999));

    const otp = new Otp(randomUUID(), code, normalizedEmail, new Date(Date.now() + expirationSeconds * 1000), false, 0);

    await this.otpRepository.save(otp);

    return code;
  }

  async verifyOtpAndLogin(
    email: string,
    code: string,
    maxAttempts: number,
    refreshExpirationSeconds: number,
  ): Promise<{ user: User; tokens: TokenPair; isNewUser: boolean }> {
    const normalizedEmail = email.toLowerCase().trim();

    const otp = await this.otpRepository.findLatestByEmail(normalizedEmail);
    if (!otp) {
      throw new InvalidOtpException();
    }

    if (!otp.isValid()) {
      throw new InvalidOtpException('OTP has expired or already been used');
    }

    if (otp.hasExceededMaxAttempts(maxAttempts)) {
      throw new InvalidOtpException('Maximum verification attempts exceeded');
    }

    // Timing-safe comparison
    const codeBuffer = Buffer.from(code.padEnd(6, '\0'));
    const otpBuffer = Buffer.from(otp.code.padEnd(6, '\0'));
    if (!timingSafeEqual(codeBuffer, otpBuffer)) {
      otp.incrementAttempts();
      await this.otpRepository.save(otp);
      throw new InvalidOtpException('Invalid code');
    }

    // Mark OTP as used
    otp.use();
    await this.otpRepository.save(otp);

    // Find or create user
    let isNewUser = false;
    let user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      isNewUser = true;
      const emailVO = Email.create(normalizedEmail);
      const defaultRole = await this.roleRepository.findDefault();
      const roles = defaultRole ? [defaultRole] : [];
      user = new User(randomUUID(), emailVO, null, '', '', true, roles);
      user = await this.userRepository.save(user);
    }

    if (!user.isActive) {
      throw new InvalidCredentialsException('Account is deactivated');
    }

    // Generate tokens
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

    return { user, tokens, isNewUser };
  }

  async loginWithOAuth(
    provider: string,
    code: string,
    redirectUri: string,
    refreshExpirationSeconds: number,
  ): Promise<{ user: User; tokens: TokenPair; isNewUser: boolean }> {
    // Validate provider
    const providerVO = OAuthProvider.create(provider);

    // Exchange code for profile
    let profile;
    try {
      profile = await this.oauthProvider.getProfile(providerVO.value, code, redirectUri);
    } catch (error) {
      if (error instanceof OAuthException) throw error;
      throw new OAuthException('Failed to exchange OAuth code for profile');
    }

    if (!profile.email) {
      throw new OAuthException('OAuth provider did not return an email address');
    }

    const normalizedEmail = profile.email.toLowerCase().trim();

    // Check if OAuth account already linked
    const existingLink = await this.oauthAccountRepository.findByProviderAndProviderUserId(
      providerVO.value,
      profile.providerUserId,
    );

    let user: User;
    let isNewUser = false;

    if (existingLink) {
      // Existing OAuth link — load user
      const found = await this.userRepository.findById(existingLink.userId);
      if (!found) {
        throw new OAuthException('Linked user account not found');
      }
      user = found;
    } else {
      // No link — check if email matches existing user
      const existingUser = await this.userRepository.findByEmail(normalizedEmail);
      if (existingUser) {
        user = existingUser;
      } else {
        // Create new user (like OTP flow — no password)
        isNewUser = true;
        const emailVO = Email.create(normalizedEmail);
        const defaultRole = await this.roleRepository.findDefault();
        const roles = defaultRole ? [defaultRole] : [];
        user = new User(randomUUID(), emailVO, null, profile.firstName || '', profile.lastName || '', true, roles);
        user = await this.userRepository.save(user);
      }

      // Link OAuth account
      const oauthAccount = new OAuthAccount(
        randomUUID(),
        user.id,
        providerVO.value,
        profile.providerUserId,
        normalizedEmail,
      );
      await this.oauthAccountRepository.save(oauthAccount);
    }

    if (!user.isActive) {
      throw new InvalidCredentialsException('Account is deactivated');
    }

    // Generate tokens
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

    return { user, tokens, isNewUser };
  }
}
