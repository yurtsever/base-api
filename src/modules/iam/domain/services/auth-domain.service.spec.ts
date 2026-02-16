import { Test, TestingModule } from '@nestjs/testing';
import { AuthDomainService } from './auth-domain.service';
import type { UserRepositoryPort } from '../ports/user-repository.port';
import { USER_REPOSITORY_PORT } from '../ports/user-repository.port';
import type { RefreshTokenRepositoryPort } from '../ports/refresh-token-repository.port';
import { REFRESH_TOKEN_REPOSITORY_PORT } from '../ports/refresh-token-repository.port';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import { PASSWORD_HASHER_PORT } from '../ports/password-hasher.port';
import type { TokenGeneratorPort } from '../ports/token-generator.port';
import { TOKEN_GENERATOR_PORT } from '../ports/token-generator.port';
import type { RoleRepositoryPort } from '../ports/role-repository.port';
import { ROLE_REPOSITORY_PORT } from '../ports/role-repository.port';
import type { OtpRepositoryPort } from '../ports/otp-repository.port';
import { OTP_REPOSITORY_PORT } from '../ports/otp-repository.port';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { Otp } from '../models/otp.model';
import { RefreshToken } from '../models/refresh-token.model';
import { Email } from '../value-objects/email.value-object';
import { Password } from '../value-objects/password.value-object';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';
import { TokenExpiredException } from '../exceptions/token-expired.exception';
import { InvalidOtpException } from '../exceptions/invalid-otp.exception';

describe('AuthDomainService', () => {
  let service: AuthDomainService;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;
  let tokenGenerator: jest.Mocked<TokenGeneratorPort>;
  let roleRepository: jest.Mocked<RoleRepositoryPort>;
  let otpRepository: jest.Mocked<OtpRepositoryPort>;

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as jest.Mocked<UserRepositoryPort>;

    refreshTokenRepository = {
      save: jest.fn(),
      findByToken: jest.fn(),
      revokeByToken: jest.fn(),
      revokeAllByUserId: jest.fn(),
      deleteExpired: jest.fn(),
      rotateToken: jest.fn(),
    } as jest.Mocked<RefreshTokenRepositoryPort>;

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as jest.Mocked<PasswordHasherPort>;

    tokenGenerator = {
      generateTokenPair: jest.fn(),
      verifyAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
    } as jest.Mocked<TokenGeneratorPort>;

    roleRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findDefault: jest.fn(),
      findAll: jest.fn(),
    } as jest.Mocked<RoleRepositoryPort>;

    otpRepository = {
      save: jest.fn(),
      findLatestByEmail: jest.fn(),
      invalidateAllByEmail: jest.fn(),
      deleteExpired: jest.fn(),
    } as jest.Mocked<OtpRepositoryPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthDomainService,
        { provide: USER_REPOSITORY_PORT, useValue: userRepository },
        { provide: REFRESH_TOKEN_REPOSITORY_PORT, useValue: refreshTokenRepository },
        { provide: PASSWORD_HASHER_PORT, useValue: passwordHasher },
        { provide: TOKEN_GENERATOR_PORT, useValue: tokenGenerator },
        { provide: ROLE_REPOSITORY_PORT, useValue: roleRepository },
        { provide: OTP_REPOSITORY_PORT, useValue: otpRepository },
      ],
    }).compile();

    service = module.get<AuthDomainService>(AuthDomainService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const defaultRole = new Role('role-1', 'user', 'Default', true, []);
      roleRepository.findDefault.mockResolvedValue(defaultRole);
      userRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue('hashed-password');
      userRepository.save.mockImplementation((user: User) => Promise.resolve(user));

      const result = await service.register('test@example.com', 'StrongP@ss1', 'John', 'Doe');

      expect(result).toBeInstanceOf(User);
      expect(userRepository.save).toHaveBeenCalled();
      expect(passwordHasher.hash).toHaveBeenCalledWith('StrongP@ss1');
    });

    it('should throw if user already exists', async () => {
      const existingUser = new User(
        'existing-id',
        Email.create('test@example.com'),
        Password.createFromHash('hash'),
        'John',
        'Doe',
        true,
        [],
      );
      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(service.register('test@example.com', 'StrongP@ss1', 'John', 'Doe')).rejects.toThrow(
        UserAlreadyExistsException,
      );
    });
  });

  describe('login', () => {
    const mockUser = new User(
      'user-id',
      Email.create('test@example.com'),
      Password.createFromHash('hashed-password'),
      'John',
      'Doe',
      true,
      [new Role('role-1', 'user', 'Default', true, [])],
    );

    it('should login successfully', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(true);
      tokenGenerator.generateTokenPair.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      });
      refreshTokenRepository.save.mockImplementation((t: RefreshToken) => Promise.resolve(t));

      const result = await service.login('test@example.com', 'StrongP@ss1', 604800);

      expect(result.user).toBe(mockUser);
      expect(result.tokens.accessToken).toBe('access-token');
      expect(refreshTokenRepository.save).toHaveBeenCalled();
    });

    it('should throw on invalid email', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login('wrong@example.com', 'password', 604800)).rejects.toThrow(InvalidCredentialsException);
    });

    it('should throw on wrong password', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(false);

      await expect(service.login('test@example.com', 'wrong-password', 604800)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });

    it('should throw on deactivated account', async () => {
      const inactiveUser = new User(
        'user-id',
        Email.create('test@example.com'),
        Password.createFromHash('hash'),
        'John',
        'Doe',
        false, // inactive
        [],
      );
      userRepository.findByEmail.mockResolvedValue(inactiveUser);

      await expect(service.login('test@example.com', 'password', 604800)).rejects.toThrow(InvalidCredentialsException);
    });

    it('should throw when user has no password (passwordless account)', async () => {
      const passwordlessUser = new User('user-id', Email.create('test@example.com'), null, 'John', 'Doe', true, []);
      userRepository.findByEmail.mockResolvedValue(passwordlessUser);

      await expect(service.login('test@example.com', 'password', 604800)).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe('logout', () => {
    it('should revoke refresh token', async () => {
      refreshTokenRepository.revokeByToken.mockResolvedValue(undefined);

      await service.logout('refresh-token');

      expect(refreshTokenRepository.revokeByToken).toHaveBeenCalledWith('refresh-token');
    });
  });

  describe('refreshTokens', () => {
    it('should rotate tokens', async () => {
      const storedToken = new RefreshToken(
        'token-id',
        'old-refresh-token',
        'user-id',
        new Date(Date.now() + 60000),
        false,
      );
      const mockUser = new User(
        'user-id',
        Email.create('test@example.com'),
        Password.createFromHash('hash'),
        'John',
        'Doe',
        true,
        [new Role('role-1', 'user', 'Default', true, [])],
      );

      refreshTokenRepository.findByToken.mockResolvedValue(storedToken);
      userRepository.findById.mockResolvedValue(mockUser);
      tokenGenerator.generateTokenPair.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      });
      refreshTokenRepository.rotateToken.mockImplementation((_old: string, t: RefreshToken) => Promise.resolve(t));

      const result = await service.refreshTokens('old-refresh-token', 604800);

      expect(result.tokens.accessToken).toBe('new-access-token');
      expect(refreshTokenRepository.rotateToken).toHaveBeenCalledWith('old-refresh-token', expect.any(RefreshToken));
    });

    it('should throw on invalid token', async () => {
      refreshTokenRepository.findByToken.mockResolvedValue(null);

      await expect(service.refreshTokens('invalid-token', 604800)).rejects.toThrow(TokenExpiredException);
    });

    it('should throw on expired token', async () => {
      const expiredToken = new RefreshToken(
        'token-id',
        'expired-token',
        'user-id',
        new Date(Date.now() - 1000), // expired
        false,
      );
      refreshTokenRepository.findByToken.mockResolvedValue(expiredToken);

      await expect(service.refreshTokens('expired-token', 604800)).rejects.toThrow(TokenExpiredException);
    });
  });

  describe('requestOtp', () => {
    it('should generate and save OTP code', async () => {
      otpRepository.findLatestByEmail.mockResolvedValue(null);
      otpRepository.invalidateAllByEmail.mockResolvedValue(undefined);
      otpRepository.save.mockImplementation((otp: Otp) => Promise.resolve(otp));

      const code = await service.requestOtp('test@example.com', 300, 60);

      expect(code).toMatch(/^\d{6}$/);
      expect(otpRepository.invalidateAllByEmail).toHaveBeenCalledWith('test@example.com');
      expect(otpRepository.save).toHaveBeenCalled();
    });

    it('should throw if resend interval has not elapsed', async () => {
      const recentOtp = new Otp(
        'otp-id',
        '123456',
        'test@example.com',
        new Date(Date.now() + 300000),
        false,
        0,
        new Date(), // just created
      );
      otpRepository.findLatestByEmail.mockResolvedValue(recentOtp);

      await expect(service.requestOtp('test@example.com', 300, 60)).rejects.toThrow(InvalidOtpException);
    });

    it('should allow request if resend interval has elapsed', async () => {
      const oldOtp = new Otp(
        'otp-id',
        '123456',
        'test@example.com',
        new Date(Date.now() + 300000),
        false,
        0,
        new Date(Date.now() - 120000), // 2 minutes ago
      );
      otpRepository.findLatestByEmail.mockResolvedValue(oldOtp);
      otpRepository.invalidateAllByEmail.mockResolvedValue(undefined);
      otpRepository.save.mockImplementation((otp: Otp) => Promise.resolve(otp));

      const code = await service.requestOtp('test@example.com', 300, 60);

      expect(code).toMatch(/^\d{6}$/);
    });
  });

  describe('verifyOtpAndLogin', () => {
    const createValidOtp = () =>
      new Otp('otp-id', '123456', 'test@example.com', new Date(Date.now() + 300000), false, 0, new Date());

    it('should verify OTP and login existing user', async () => {
      const existingUser = new User(
        'user-id',
        Email.create('test@example.com'),
        Password.createFromHash('hash'),
        'John',
        'Doe',
        true,
        [new Role('role-1', 'user', 'Default', true, [])],
      );

      otpRepository.findLatestByEmail.mockResolvedValue(createValidOtp());
      otpRepository.save.mockImplementation((otp: Otp) => Promise.resolve(otp));
      userRepository.findByEmail.mockResolvedValue(existingUser);
      tokenGenerator.generateTokenPair.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      });
      refreshTokenRepository.save.mockImplementation((t: RefreshToken) => Promise.resolve(t));

      const result = await service.verifyOtpAndLogin('test@example.com', '123456', 5, 604800);

      expect(result.user).toBe(existingUser);
      expect(result.isNewUser).toBe(false);
      expect(result.tokens.accessToken).toBe('access-token');
    });

    it('should create new user if email not found', async () => {
      const defaultRole = new Role('role-1', 'user', 'Default', true, []);

      otpRepository.findLatestByEmail.mockResolvedValue(createValidOtp());
      otpRepository.save.mockImplementation((otp: Otp) => Promise.resolve(otp));
      userRepository.findByEmail.mockResolvedValue(null);
      roleRepository.findDefault.mockResolvedValue(defaultRole);
      userRepository.save.mockImplementation((user: User) => Promise.resolve(user));
      tokenGenerator.generateTokenPair.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      });
      refreshTokenRepository.save.mockImplementation((t: RefreshToken) => Promise.resolve(t));

      const result = await service.verifyOtpAndLogin('test@example.com', '123456', 5, 604800);

      expect(result.isNewUser).toBe(true);
      expect(result.user.hasPassword()).toBe(false);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw when no OTP found', async () => {
      otpRepository.findLatestByEmail.mockResolvedValue(null);

      await expect(service.verifyOtpAndLogin('test@example.com', '123456', 5, 604800)).rejects.toThrow(
        InvalidOtpException,
      );
    });

    it('should throw when OTP is expired', async () => {
      const expiredOtp = new Otp(
        'otp-id',
        '123456',
        'test@example.com',
        new Date(Date.now() - 1000),
        false,
        0,
        new Date(),
      );
      otpRepository.findLatestByEmail.mockResolvedValue(expiredOtp);

      await expect(service.verifyOtpAndLogin('test@example.com', '123456', 5, 604800)).rejects.toThrow(
        InvalidOtpException,
      );
    });

    it('should throw when max attempts exceeded', async () => {
      const maxedOtp = new Otp(
        'otp-id',
        '123456',
        'test@example.com',
        new Date(Date.now() + 300000),
        false,
        5,
        new Date(),
      );
      otpRepository.findLatestByEmail.mockResolvedValue(maxedOtp);

      await expect(service.verifyOtpAndLogin('test@example.com', '123456', 5, 604800)).rejects.toThrow(
        InvalidOtpException,
      );
    });

    it('should increment attempts on wrong code', async () => {
      otpRepository.findLatestByEmail.mockResolvedValue(createValidOtp());
      otpRepository.save.mockImplementation((otp: Otp) => Promise.resolve(otp));

      await expect(service.verifyOtpAndLogin('test@example.com', '000000', 5, 604800)).rejects.toThrow(
        InvalidOtpException,
      );

      expect(otpRepository.save).toHaveBeenCalled();
    });

    it('should throw when user account is deactivated', async () => {
      const inactiveUser = new User('user-id', Email.create('test@example.com'), null, 'John', 'Doe', false, []);

      otpRepository.findLatestByEmail.mockResolvedValue(createValidOtp());
      otpRepository.save.mockImplementation((otp: Otp) => Promise.resolve(otp));
      userRepository.findByEmail.mockResolvedValue(inactiveUser);

      await expect(service.verifyOtpAndLogin('test@example.com', '123456', 5, 604800)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });
});
