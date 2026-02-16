import { Test, TestingModule } from '@nestjs/testing';
import { ExpiredOtpCleanupTask } from './expired-otp-cleanup.task';
import { OTP_REPOSITORY_PORT } from '../../domain/ports/otp-repository.port';
import type { OtpRepositoryPort } from '../../domain/ports/otp-repository.port';

describe('ExpiredOtpCleanupTask', () => {
  let task: ExpiredOtpCleanupTask;
  let otpRepository: jest.Mocked<OtpRepositoryPort>;

  beforeEach(async () => {
    otpRepository = {
      save: jest.fn(),
      findLatestByEmail: jest.fn(),
      invalidateAllByEmail: jest.fn(),
      deleteExpired: jest.fn(),
    } as jest.Mocked<OtpRepositoryPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpiredOtpCleanupTask, { provide: OTP_REPOSITORY_PORT, useValue: otpRepository }],
    }).compile();

    task = module.get<ExpiredOtpCleanupTask>(ExpiredOtpCleanupTask);
  });

  it('should be defined', () => {
    expect(task).toBeDefined();
  });

  it('should call deleteExpired on repository', async () => {
    otpRepository.deleteExpired.mockResolvedValue(undefined);

    await task.handleCleanup();

    expect(otpRepository.deleteExpired).toHaveBeenCalled();
  });

  it('should not throw on repository error', async () => {
    otpRepository.deleteExpired.mockRejectedValue(new Error('DB error'));

    await expect(task.handleCleanup()).resolves.not.toThrow();
  });
});
