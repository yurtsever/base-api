import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuditRetentionCleanupTask } from './audit-retention-cleanup.task';
import { AUDIT_REPOSITORY_PORT } from '../../domain/ports/audit-repository.port';

describe('AuditRetentionCleanupTask', () => {
  let task: AuditRetentionCleanupTask;
  let repository: { deleteOlderThan: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    repository = { deleteOlderThan: jest.fn().mockResolvedValue(10) };
    configService = { get: jest.fn().mockReturnValue(90) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditRetentionCleanupTask,
        { provide: AUDIT_REPOSITORY_PORT, useValue: repository },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    task = module.get(AuditRetentionCleanupTask);
  });

  it('should delete entries older than configured retention days', async () => {
    await task.handleCleanup();

    expect(configService.get).toHaveBeenCalledWith('audit.retentionDays', 90);
    expect(repository.deleteOlderThan).toHaveBeenCalledWith(expect.any(Date));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const cutoffDate = repository.deleteOlderThan.mock.calls[0][0] as Date;
    const expectedCutoff = new Date();
    expectedCutoff.setDate(expectedCutoff.getDate() - 90);

    // Allow 1 second tolerance
    expect(Math.abs(cutoffDate.getTime() - expectedCutoff.getTime())).toBeLessThan(1000);
  });

  it('should use custom retention days from config', async () => {
    configService.get.mockReturnValue(30);

    await task.handleCleanup();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const cutoffDate = repository.deleteOlderThan.mock.calls[0][0] as Date;
    const expectedCutoff = new Date();
    expectedCutoff.setDate(expectedCutoff.getDate() - 30);

    expect(Math.abs(cutoffDate.getTime() - expectedCutoff.getTime())).toBeLessThan(1000);
  });

  it('should not throw when repository fails', async () => {
    repository.deleteOlderThan.mockRejectedValue(new Error('DB error'));

    await expect(task.handleCleanup()).resolves.toBeUndefined();
  });
});
