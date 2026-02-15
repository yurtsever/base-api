import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { GET_AUDIT_ENTRIES_USE_CASE } from '../../application/ports/get-audit-entries.use-case';
import { GET_AUDIT_ENTRY_BY_ID_USE_CASE } from '../../application/ports/get-audit-entry-by-id.use-case';

describe('AuditController', () => {
  let controller: AuditController;
  let getAuditEntriesUseCase: { execute: jest.Mock };
  let getAuditEntryByIdUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    getAuditEntriesUseCase = { execute: jest.fn() };
    getAuditEntryByIdUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        { provide: GET_AUDIT_ENTRIES_USE_CASE, useValue: getAuditEntriesUseCase },
        { provide: GET_AUDIT_ENTRY_BY_ID_USE_CASE, useValue: getAuditEntryByIdUseCase },
      ],
    }).compile();

    controller = module.get(AuditController);
  });

  describe('getAuditEntries', () => {
    it('should delegate to use case with converted filters', async () => {
      const paginatedResult = {
        items: [],
        meta: { total: 0, limit: 100, offset: 0, hasNext: false, hasPrev: false },
      };
      getAuditEntriesUseCase.execute.mockResolvedValue(paginatedResult);

      const query = {
        limit: 10,
        offset: 0,
        userId: 'user-1',
        action: 'HTTP_REQUEST',
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2025-12-31T23:59:59.999Z',
      };

      const result = await controller.getAuditEntries(query);

      expect(result).toBe(paginatedResult);
      expect(getAuditEntriesUseCase.execute).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        userId: 'user-1',
        action: 'HTTP_REQUEST',
        resource: undefined,
        entityId: undefined,
        startDate: new Date('2025-01-01T00:00:00.000Z'),
        endDate: new Date('2025-12-31T23:59:59.999Z'),
      });
    });
  });

  describe('getAuditEntryById', () => {
    it('should delegate to use case', async () => {
      const entry = { id: 'test-id', action: 'HTTP_REQUEST' };
      getAuditEntryByIdUseCase.execute.mockResolvedValue(entry);

      const result = await controller.getAuditEntryById('test-id');

      expect(result).toBe(entry);
      expect(getAuditEntryByIdUseCase.execute).toHaveBeenCalledWith('test-id');
    });
  });
});
