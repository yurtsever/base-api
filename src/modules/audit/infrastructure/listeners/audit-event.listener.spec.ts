import { Test, TestingModule } from '@nestjs/testing';
import { AuditEventListener } from './audit-event.listener';
import { AUDIT_REPOSITORY_PORT } from '../../domain/ports/audit-repository.port';
import { AuditEvent } from '../../application/events/audit.event';
import type { AuditEntry } from '../../domain/models/audit-entry.model';

describe('AuditEventListener', () => {
  let listener: AuditEventListener;
  let repository: { save: jest.Mock };

  beforeEach(async () => {
    repository = { save: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditEventListener, { provide: AUDIT_REPOSITORY_PORT, useValue: repository }],
    }).compile();

    listener = module.get(AuditEventListener);
  });

  it('should create and save an audit entry from event', async () => {
    const event = new AuditEvent({
      action: 'USER_LOGIN',
      resource: 'auth',
      userId: 'user-1',
      userEmail: 'test@example.com',
      path: '/api/auth/login',
      statusCode: 200,
    });

    await listener.handleAuditEvent(event);

    expect(repository.save).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const savedEntry = repository.save.mock.calls[0][0] as AuditEntry;
    expect(savedEntry.action).toBe('USER_LOGIN');
    expect(savedEntry.resource).toBe('auth');
    expect(savedEntry.userId).toBe('user-1');
    expect(savedEntry.ipAddress).toBe('system');
    expect(savedEntry.method).toBe('INTERNAL');
  });

  it('should not throw when repository save fails', async () => {
    repository.save.mockRejectedValue(new Error('DB error'));

    const event = new AuditEvent({
      action: 'USER_LOGIN',
      resource: 'auth',
      path: '/api/auth/login',
      statusCode: 200,
    });

    await expect(listener.handleAuditEvent(event)).resolves.toBeUndefined();
  });
});
