import { ListApiKeysUseCase } from './list-api-keys.use-case';
import type { ApiKeyRepositoryPort } from '../../domain/ports/api-key-repository.port';
import { ApiKey } from '../../domain/models/api-key.model';

describe('ListApiKeysUseCase', () => {
  let useCase: ListApiKeysUseCase;
  let mockApiKeyRepository: jest.Mocked<ApiKeyRepositoryPort>;

  beforeEach(() => {
    mockApiKeyRepository = {
      save: jest.fn(),
      findByKeyHash: jest.fn(),
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      revokeById: jest.fn(),
      updateLastUsed: jest.fn(),
    };

    useCase = new ListApiKeysUseCase(mockApiKeyRepository);
  });

  it('should return list of API keys without raw key', async () => {
    const now = new Date();
    const keys = [
      new ApiKey('key-1', 'user-id', 'Key 1', 'hash1', 'bak_a1b2c3d4', ['users:read'], null, now, false, now, now),
      new ApiKey('key-2', 'user-id', 'Key 2', 'hash2', 'bak_e5f6g7h8', ['audit:read'], null, null, true, now, now),
    ];
    mockApiKeyRepository.findAllByUserId.mockResolvedValue(keys);

    const result = await useCase.execute('user-id');

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('key-1');
    expect(result[0].name).toBe('Key 1');
    expect(result[0].keyPrefix).toBe('bak_a1b2c3d4');
    expect(result[0].scopes).toEqual(['users:read']);
    expect(result[0].lastUsedAt).toBe(now.toISOString());
    expect(result[1].isRevoked).toBe(true);
    expect(result[1].lastUsedAt).toBeNull();
    expect(mockApiKeyRepository.findAllByUserId).toHaveBeenCalledWith('user-id');
  });

  it('should return empty array when no keys exist', async () => {
    mockApiKeyRepository.findAllByUserId.mockResolvedValue([]);

    const result = await useCase.execute('user-id');

    expect(result).toEqual([]);
  });
});
