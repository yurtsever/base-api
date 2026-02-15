import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmAuditRepositoryAdapter } from './typeorm-audit-repository.adapter';
import { AuditEntryEntity } from '../entities/audit-entry.entity';
import { AuditEntry } from '../../../domain/models/audit-entry.model';

describe('TypeOrmAuditRepositoryAdapter', () => {
  let adapter: TypeOrmAuditRepositoryAdapter;
  let repository: {
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
    delete: jest.Mock;
  };
  let queryBuilder: {
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    repository = {
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmAuditRepositoryAdapter,
        { provide: getRepositoryToken(AuditEntryEntity), useValue: repository },
      ],
    }).compile();

    adapter = module.get(TypeOrmAuditRepositoryAdapter);
  });

  describe('save', () => {
    it('should save and return a domain audit entry', async () => {
      const entry = AuditEntry.create({
        action: 'HTTP_REQUEST',
        resource: 'users',
        ipAddress: '127.0.0.1',
        method: 'GET',
        path: '/api/users',
        statusCode: 200,
        duration: 100,
      });

      const savedEntity = new AuditEntryEntity();
      savedEntity.id = entry.id;
      savedEntity.action = 'HTTP_REQUEST';
      savedEntity.resource = 'users';
      savedEntity.ipAddress = '127.0.0.1';
      savedEntity.method = 'GET';
      savedEntity.path = '/api/users';
      savedEntity.statusCode = 200;
      savedEntity.duration = 100;
      savedEntity.createdAt = new Date();

      repository.save.mockResolvedValue(savedEntity);

      const result = await adapter.save(entry);

      expect(result).toBeInstanceOf(AuditEntry);
      expect(result.action).toBe('HTTP_REQUEST');
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return domain entry when found', async () => {
      const entity = new AuditEntryEntity();
      entity.id = 'test-id';
      entity.action = 'HTTP_REQUEST';
      entity.resource = 'users';
      entity.ipAddress = '127.0.0.1';
      entity.method = 'GET';
      entity.path = '/api/users';
      entity.statusCode = 200;
      entity.duration = 100;
      entity.createdAt = new Date();

      repository.findOne.mockResolvedValue(entity);

      const result = await adapter.findById('test-id');

      expect(result).toBeInstanceOf(AuditEntry);
      expect(result?.id).toBe('test-id');
    });

    it('should return null when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should apply filters and return paginated results', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await adapter.findAll({
        userId: 'user-1',
        action: 'HTTP_REQUEST',
        resource: 'users',
        entityId: 'entity-1',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        limit: 10,
        offset: 0,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(6);
      expect(result.items).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should use default pagination when not provided', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await adapter.findAll({});

      expect(queryBuilder.take).toHaveBeenCalledWith(100);
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    });
  });

  describe('deleteOlderThan', () => {
    it('should return the number of deleted records', async () => {
      repository.delete.mockResolvedValue({ affected: 5 });

      const result = await adapter.deleteOlderThan(new Date());

      expect(result).toBe(5);
    });

    it('should return 0 when no records deleted', async () => {
      repository.delete.mockResolvedValue({ affected: 0 });

      const result = await adapter.deleteOlderThan(new Date());

      expect(result).toBe(0);
    });
  });
});
