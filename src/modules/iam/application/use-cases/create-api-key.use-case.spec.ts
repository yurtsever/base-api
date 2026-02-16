import { CreateApiKeyUseCase } from './create-api-key.use-case';
import type { ApiKeyRepositoryPort } from '../../domain/ports/api-key-repository.port';
import type { ApiKeyHasherPort } from '../../domain/ports/api-key-hasher.port';
import { ApiKey } from '../../domain/models/api-key.model';

describe('CreateApiKeyUseCase', () => {
  let useCase: CreateApiKeyUseCase;
  let mockApiKeyRepository: jest.Mocked<ApiKeyRepositoryPort>;
  let mockApiKeyHasher: jest.Mocked<ApiKeyHasherPort>;

  beforeEach(() => {
    mockApiKeyRepository = {
      save: jest.fn(),
      findByKeyHash: jest.fn(),
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      revokeById: jest.fn(),
      updateLastUsed: jest.fn(),
    };

    mockApiKeyHasher = {
      hash: jest.fn(),
      generateKey: jest.fn(),
    };

    useCase = new CreateApiKeyUseCase(mockApiKeyRepository, mockApiKeyHasher);
  });

  it('should create an API key and return raw key', async () => {
    const now = new Date();
    mockApiKeyHasher.generateKey.mockReturnValue({
      raw: 'bak_abc123def456',
      hash: 'hashedvalue',
      prefix: 'bak_abc123de',
    });

    const savedKey = new ApiKey(
      'generated-id',
      'user-id',
      'CI Pipeline',
      'hashedvalue',
      'bak_abc123de',
      ['users:read'],
      null,
      null,
      false,
      now,
      now,
    );
    mockApiKeyRepository.save.mockResolvedValue(savedKey);

    const result = await useCase.execute('user-id', {
      name: 'CI Pipeline',
      scopes: ['users:read'],
    });

    expect(result.key).toBe('bak_abc123def456');
    expect(result.name).toBe('CI Pipeline');
    expect(result.keyPrefix).toBe('bak_abc123de');
    expect(result.scopes).toEqual(['users:read']);
    expect(result.expiresAt).toBeNull();
    expect(mockApiKeyHasher.generateKey).toHaveBeenCalled();
    expect(mockApiKeyRepository.save).toHaveBeenCalled();
  });

  it('should handle expiresAt when provided', async () => {
    const now = new Date();
    const expiresAt = '2026-12-31T00:00:00Z';

    mockApiKeyHasher.generateKey.mockReturnValue({
      raw: 'bak_abc123def456',
      hash: 'hashedvalue',
      prefix: 'bak_abc123de',
    });

    const savedKey = new ApiKey(
      'generated-id',
      'user-id',
      'Temp Key',
      'hashedvalue',
      'bak_abc123de',
      ['users:read'],
      new Date(expiresAt),
      null,
      false,
      now,
      now,
    );
    mockApiKeyRepository.save.mockResolvedValue(savedKey);

    const result = await useCase.execute('user-id', {
      name: 'Temp Key',
      scopes: ['users:read'],
      expiresAt,
    });

    expect(result.expiresAt).toBe(new Date(expiresAt).toISOString());
  });
});
