import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditEmitterService } from './audit-emitter.service';
import { AUDIT_EVENT_NAME } from '../../application/events/audit.event';

describe('AuditEmitterService', () => {
  let service: AuditEmitterService;
  let eventEmitter: { emit: jest.Mock };

  beforeEach(async () => {
    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditEmitterService, { provide: EventEmitter2, useValue: eventEmitter }],
    }).compile();

    service = module.get(AuditEmitterService);
  });

  it('should emit an audit event with the correct event name', () => {
    service.emit({
      action: 'USER_LOGIN',
      resource: 'auth',
      userId: 'user-1',
      path: '/api/auth/login',
      statusCode: 200,
    });

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      AUDIT_EVENT_NAME,
      expect.objectContaining({
        action: 'USER_LOGIN',
        resource: 'auth',
        userId: 'user-1',
        ipAddress: 'system',
        method: 'INTERNAL',
      }),
    );
  });

  it('should allow overriding defaults', () => {
    service.emit({
      action: 'USER_LOGIN',
      resource: 'auth',
      ipAddress: '192.168.1.1',
      method: 'POST',
      path: '/api/auth/login',
      statusCode: 200,
      duration: 50,
    });

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      AUDIT_EVENT_NAME,
      expect.objectContaining({
        ipAddress: '192.168.1.1',
        method: 'POST',
        duration: 50,
      }),
    );
  });
});
