import { Test, TestingModule } from '@nestjs/testing';
import { GetAuditEntriesUseCase } from './get-audit-entries.use-case';
import { AUDIT_REPOSITORY_PORT } from '../../domain/ports/audit-repository.port';
import { AuditEntry } from '../../domain/models/audit-entry.model';

describe('GetAuditEntriesUseCase', () => {
  let useCase: GetAuditEntriesUseCase;
  let repository: { findAll: jest.Mock };

  beforeEach(async () => {
    repository = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetAuditEntriesUseCase, { provide: AUDIT_REPOSITORY_PORT, useValue: repository }],
    }).compile();

    useCase = module.get(GetAuditEntriesUseCase);
  });

  it('should return paginated audit entries as JSON', async () => {
    const entry = AuditEntry.create({
      action: 'HTTP_REQUEST',
      resource: 'users',
      ipAddress: '127.0.0.1',
      method: 'GET',
      path: '/api/users',
      statusCode: 200,
      duration: 100,
    });

    repository.findAll.mockResolvedValue({
      items: [entry],
      meta: { total: 1, limit: 100, offset: 0, hasNext: false, hasPrev: false },
    });

    const result = await useCase.execute({ limit: 100, offset: 0 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(entry.toJSON());
    expect(result.meta.total).toBe(1);
    expect(repository.findAll).toHaveBeenCalledWith({ limit: 100, offset: 0 });
  });

  it('should pass filter options to repository', async () => {
    repository.findAll.mockResolvedValue({
      items: [],
      meta: { total: 0, limit: 100, offset: 0, hasNext: false, hasPrev: false },
    });

    const filters = {
      userId: 'user-1',
      action: 'USER_LOGIN',
      resource: 'auth',
      limit: 10,
      offset: 0,
    };

    await useCase.execute(filters);

    expect(repository.findAll).toHaveBeenCalledWith(filters);
  });
});
