import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmApiKeyRepositoryAdapter } from './typeorm-api-key-repository.adapter';
import { ApiKeyEntity } from '../entities/api-key.entity';
import { ApiKey } from '../../../domain/models/api-key.model';

describe('TypeOrmApiKeyRepositoryAdapter', () => {
  let adapter: TypeOrmApiKeyRepositoryAdapter;
  let mockRepository: {
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    update: jest.Mock;
  };

  const now = new Date();
  const mockApiKeyEntity: ApiKeyEntity = {
    id: 'key-id',
    userId: 'user-id',
    name: 'CI Key',
    keyHash: 'hash123',
    keyPrefix: 'bak_a1b2c3d4',
    scopes: JSON.stringify(['users:read']),
    expiresAt: null,
    lastUsedAt: null,
    isRevoked: false,
    createdAt: now,
    updatedAt: now,
  } as ApiKeyEntity;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmApiKeyRepositoryAdapter,
        { provide: getRepositoryToken(ApiKeyEntity), useValue: mockRepository },
      ],
    }).compile();

    adapter = module.get<TypeOrmApiKeyRepositoryAdapter>(TypeOrmApiKeyRepositoryAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('save', () => {
    it('should save and return API key', async () => {
      mockRepository.save.mockResolvedValue(mockApiKeyEntity);

      const apiKey = new ApiKey(
        'key-id',
        'user-id',
        'CI Key',
        'hash123',
        'bak_a1b2c3d4',
        ['users:read'],
        null,
        null,
        false,
      );
      const result = await adapter.save(apiKey);

      expect(result).toBeInstanceOf(ApiKey);
      expect(result.name).toBe('CI Key');
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findByKeyHash', () => {
    it('should return API key when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockApiKeyEntity);

      const result = await adapter.findByKeyHash('hash123');

      expect(result).toBeInstanceOf(ApiKey);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { keyHash: 'hash123' } });
    });

    it('should return null when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await adapter.findByKeyHash('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAllByUserId', () => {
    it('should return all API keys for user', async () => {
      mockRepository.find.mockResolvedValue([mockApiKeyEntity]);

      const result = await adapter.findAllByUserId('user-id');

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ApiKey);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findById', () => {
    it('should return API key when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockApiKeyEntity);

      const result = await adapter.findById('key-id');

      expect(result).toBeInstanceOf(ApiKey);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'key-id' } });
    });

    it('should return null when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await adapter.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('revokeById', () => {
    it('should update isRevoked to true', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await adapter.revokeById('key-id');

      expect(mockRepository.update).toHaveBeenCalledWith('key-id', { isRevoked: true });
    });
  });

  describe('updateLastUsed', () => {
    it('should update lastUsedAt', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await adapter.updateLastUsed('key-id');

      expect(mockRepository.update).toHaveBeenCalledWith(
        'key-id',
        expect.objectContaining({ lastUsedAt: expect.any(Date) }),
      );
    });
  });
});
