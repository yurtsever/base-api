import { RevokeApiKeyUseCase } from './revoke-api-key.use-case';
import type { ApiKeyRepositoryPort } from '../../domain/ports/api-key-repository.port';
import { ApiKey } from '../../domain/models/api-key.model';
import { InvalidApiKeyException } from '../../domain/exceptions/invalid-api-key.exception';

describe('RevokeApiKeyUseCase', () => {
  let useCase: RevokeApiKeyUseCase;
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

    useCase = new RevokeApiKeyUseCase(mockApiKeyRepository);
  });

  it('should revoke own API key', async () => {
    const apiKey = new ApiKey('key-id', 'user-id', 'Key', 'hash', 'bak_prefix1', ['users:read'], null, null, false);
    mockApiKeyRepository.findById.mockResolvedValue(apiKey);
    mockApiKeyRepository.revokeById.mockResolvedValue();

    await useCase.execute('key-id', 'user-id', false);

    expect(mockApiKeyRepository.revokeById).toHaveBeenCalledWith('key-id');
  });

  it('should allow admin to revoke any key', async () => {
    const apiKey = new ApiKey(
      'key-id',
      'other-user-id',
      'Key',
      'hash',
      'bak_prefix1',
      ['users:read'],
      null,
      null,
      false,
    );
    mockApiKeyRepository.findById.mockResolvedValue(apiKey);
    mockApiKeyRepository.revokeById.mockResolvedValue();

    await useCase.execute('key-id', 'admin-user-id', true);

    expect(mockApiKeyRepository.revokeById).toHaveBeenCalledWith('key-id');
  });

  it('should throw when key not found', async () => {
    mockApiKeyRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', 'user-id', false)).rejects.toThrow(InvalidApiKeyException);
  });

  it('should throw when non-admin tries to revoke another user key', async () => {
    const apiKey = new ApiKey(
      'key-id',
      'other-user-id',
      'Key',
      'hash',
      'bak_prefix1',
      ['users:read'],
      null,
      null,
      false,
    );
    mockApiKeyRepository.findById.mockResolvedValue(apiKey);

    await expect(useCase.execute('key-id', 'user-id', false)).rejects.toThrow(InvalidApiKeyException);
  });
});
