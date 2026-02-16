import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmOAuthAccountRepositoryAdapter } from './typeorm-oauth-account-repository.adapter';
import { OAuthAccountEntity } from '../entities/oauth-account.entity';
import { OAuthAccount } from '../../../domain/models/oauth-account.model';

describe('TypeOrmOAuthAccountRepositoryAdapter', () => {
  let adapter: TypeOrmOAuthAccountRepositoryAdapter;
  let repository: {
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    softDelete: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmOAuthAccountRepositoryAdapter,
        { provide: getRepositoryToken(OAuthAccountEntity), useValue: repository },
      ],
    }).compile();

    adapter = module.get<TypeOrmOAuthAccountRepositoryAdapter>(TypeOrmOAuthAccountRepositoryAdapter);
  });

  describe('save', () => {
    it('should save and return domain model', async () => {
      const now = new Date();
      const savedEntity = new OAuthAccountEntity();
      savedEntity.id = 'acc-1';
      savedEntity.userId = 'user-1';
      savedEntity.provider = 'google';
      savedEntity.providerUserId = 'goog-123';
      savedEntity.email = 'test@example.com';
      savedEntity.createdAt = now;
      savedEntity.updatedAt = now;
      repository.save.mockResolvedValue(savedEntity);

      const account = new OAuthAccount('acc-1', 'user-1', 'google', 'goog-123', 'test@example.com');
      const result = await adapter.save(account);

      expect(repository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(OAuthAccount);
      expect(result.id).toBe('acc-1');
    });
  });

  describe('findByProviderAndProviderUserId', () => {
    it('should return domain model when found', async () => {
      const entity = new OAuthAccountEntity();
      entity.id = 'acc-1';
      entity.userId = 'user-1';
      entity.provider = 'google';
      entity.providerUserId = 'goog-123';
      entity.email = 'test@example.com';
      entity.createdAt = new Date();
      entity.updatedAt = new Date();
      repository.findOne.mockResolvedValue(entity);

      const result = await adapter.findByProviderAndProviderUserId('google', 'goog-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { provider: 'google', providerUserId: 'goog-123' },
      });
      expect(result).toBeInstanceOf(OAuthAccount);
    });

    it('should return null when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.findByProviderAndProviderUserId('google', 'unknown');

      expect(result).toBeNull();
    });
  });

  describe('findAllByUserId', () => {
    it('should return array of domain models', async () => {
      const entity = new OAuthAccountEntity();
      entity.id = 'acc-1';
      entity.userId = 'user-1';
      entity.provider = 'google';
      entity.providerUserId = 'goog-123';
      entity.email = 'test@example.com';
      entity.createdAt = new Date();
      entity.updatedAt = new Date();
      repository.find.mockResolvedValue([entity]);

      const result = await adapter.findAllByUserId('user-1');

      expect(repository.find).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(OAuthAccount);
    });
  });

  describe('deleteByProviderAndUserId', () => {
    it('should soft-delete by provider and userId', async () => {
      repository.softDelete.mockResolvedValue({ affected: 1 });

      await adapter.deleteByProviderAndUserId('google', 'user-1');

      expect(repository.softDelete).toHaveBeenCalledWith({ provider: 'google', userId: 'user-1' });
    });
  });
});
