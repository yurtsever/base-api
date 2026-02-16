import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { ApiKeyRepositoryPort } from '../../domain/ports/api-key-repository.port';
import type { ApiKeyHasherPort } from '../../domain/ports/api-key-hasher.port';
import type { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { ApiKey } from '../../domain/models/api-key.model';
import { User } from '../../domain/models/user.model';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';
import { InvalidApiKeyException } from '../../domain/exceptions/invalid-api-key.exception';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let mockApiKeyRepository: jest.Mocked<ApiKeyRepositoryPort>;
  let mockApiKeyHasher: jest.Mocked<ApiKeyHasherPort>;
  let mockUserRepository: jest.Mocked<UserRepositoryPort>;

  beforeEach(() => {
    reflector = new Reflector();

    mockApiKeyRepository = {
      save: jest.fn(),
      findByKeyHash: jest.fn(),
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      revokeById: jest.fn(),
      updateLastUsed: jest.fn().mockResolvedValue(undefined),
    };

    mockApiKeyHasher = {
      hash: jest.fn(),
      generateKey: jest.fn(),
    };

    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    guard = new JwtAuthGuard(reflector, mockApiKeyRepository, mockApiKeyHasher, mockUserRepository);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true for public routes', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ headers: {} }),
      }),
    } as unknown as ExecutionContext;

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should check isPublic metadata from both handler and class', async () => {
    const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const handler = jest.fn();
    const klass = jest.fn();

    const context = {
      getHandler: jest.fn().mockReturnValue(handler),
      getClass: jest.fn().mockReturnValue(klass),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ headers: {} }),
      }),
    } as unknown as ExecutionContext;

    await guard.canActivate(context);

    expect(getAllAndOverrideSpy).toHaveBeenCalledWith('isPublic', [handler, klass]);
  });

  describe('API key authentication', () => {
    const createMockContext = (headers: Record<string, string> = {}) => {
      const request = { headers, user: undefined };
      return {
        context: {
          getHandler: jest.fn(),
          getClass: jest.fn(),
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(request),
          }),
        } as unknown as ExecutionContext,
        request,
      };
    };

    it('should authenticate with valid API key', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const { context, request } = createMockContext({ 'x-api-key': 'bak_testkey123' });

      mockApiKeyHasher.hash.mockReturnValue('hashed_key');
      const apiKey = new ApiKey(
        'key-id',
        'user-id',
        'Test',
        'hashed_key',
        'bak_testkey1',
        ['users:read'],
        null,
        null,
        false,
      );
      mockApiKeyRepository.findByKeyHash.mockResolvedValue(apiKey);

      const user = new User(
        'user-id',
        Email.create('test@example.com'),
        Password.createFromHash('hash'),
        'John',
        'Doe',
        true,
        [],
      );
      mockUserRepository.findById.mockResolvedValue(user);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect((request as Record<string, unknown>).user).toEqual({
        sub: 'user-id',
        email: 'test@example.com',
        roles: [],
        scopes: ['users:read'],
        isApiKey: true,
      });
      expect(mockApiKeyRepository.updateLastUsed).toHaveBeenCalledWith('key-id');
    });

    it('should throw for invalid API key (not found)', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const { context } = createMockContext({ 'x-api-key': 'bak_invalid' });

      mockApiKeyHasher.hash.mockReturnValue('hashed_invalid');
      mockApiKeyRepository.findByKeyHash.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(InvalidApiKeyException);
    });

    it('should throw for revoked API key', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const { context } = createMockContext({ 'x-api-key': 'bak_revoked' });

      mockApiKeyHasher.hash.mockReturnValue('hashed_revoked');
      const apiKey = new ApiKey(
        'key-id',
        'user-id',
        'Test',
        'hashed_revoked',
        'bak_revoked1',
        ['users:read'],
        null,
        null,
        true,
      );
      mockApiKeyRepository.findByKeyHash.mockResolvedValue(apiKey);

      await expect(guard.canActivate(context)).rejects.toThrow(InvalidApiKeyException);
    });

    it('should throw for expired API key', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const { context } = createMockContext({ 'x-api-key': 'bak_expired' });

      mockApiKeyHasher.hash.mockReturnValue('hashed_expired');
      const pastDate = new Date(Date.now() - 86400000);
      const apiKey = new ApiKey(
        'key-id',
        'user-id',
        'Test',
        'hashed_expired',
        'bak_expired1',
        ['users:read'],
        pastDate,
        null,
        false,
      );
      mockApiKeyRepository.findByKeyHash.mockResolvedValue(apiKey);

      await expect(guard.canActivate(context)).rejects.toThrow(InvalidApiKeyException);
    });

    it('should throw when user is not found', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const { context } = createMockContext({ 'x-api-key': 'bak_nouser' });

      mockApiKeyHasher.hash.mockReturnValue('hashed_key');
      const apiKey = new ApiKey(
        'key-id',
        'deleted-user',
        'Test',
        'hashed_key',
        'bak_nouser12',
        ['users:read'],
        null,
        null,
        false,
      );
      mockApiKeyRepository.findByKeyHash.mockResolvedValue(apiKey);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(InvalidApiKeyException);
    });

    it('should throw when user is inactive', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const { context } = createMockContext({ 'x-api-key': 'bak_inactive' });

      mockApiKeyHasher.hash.mockReturnValue('hashed_key');
      const apiKey = new ApiKey(
        'key-id',
        'user-id',
        'Test',
        'hashed_key',
        'bak_inactive',
        ['users:read'],
        null,
        null,
        false,
      );
      mockApiKeyRepository.findByKeyHash.mockResolvedValue(apiKey);

      const user = new User(
        'user-id',
        Email.create('test@example.com'),
        Password.createFromHash('hash'),
        'John',
        'Doe',
        false,
        [],
      );
      mockUserRepository.findById.mockResolvedValue(user);

      await expect(guard.canActivate(context)).rejects.toThrow(InvalidApiKeyException);
    });
  });
});
