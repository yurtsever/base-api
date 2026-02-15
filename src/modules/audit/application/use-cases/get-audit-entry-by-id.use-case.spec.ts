import { Test, TestingModule } from '@nestjs/testing';
import { GetAuditEntryByIdUseCase } from './get-audit-entry-by-id.use-case';
import { AUDIT_REPOSITORY_PORT } from '../../domain/ports/audit-repository.port';
import { AuditEntry } from '../../domain/models/audit-entry.model';
import { AuditEntryNotFoundException } from '../../domain/exceptions/audit-entry-not-found.exception';

describe('GetAuditEntryByIdUseCase', () => {
  let useCase: GetAuditEntryByIdUseCase;
  let repository: { findById: jest.Mock };

  beforeEach(async () => {
    repository = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetAuditEntryByIdUseCase, { provide: AUDIT_REPOSITORY_PORT, useValue: repository }],
    }).compile();

    useCase = module.get(GetAuditEntryByIdUseCase);
  });

  it('should return an audit entry as JSON when found', async () => {
    const entry = AuditEntry.create({
      action: 'HTTP_REQUEST',
      resource: 'users',
      ipAddress: '127.0.0.1',
      method: 'GET',
      path: '/api/users',
      statusCode: 200,
      duration: 100,
    });

    repository.findById.mockResolvedValue(entry);

    const result = await useCase.execute(entry.id);

    expect(result).toEqual(entry.toJSON());
    expect(repository.findById).toHaveBeenCalledWith(entry.id);
  });

  it('should throw AuditEntryNotFoundException when not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(AuditEntryNotFoundException);
  });
});
