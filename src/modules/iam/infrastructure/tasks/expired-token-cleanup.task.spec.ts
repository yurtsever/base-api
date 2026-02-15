import { Test, TestingModule } from '@nestjs/testing';
import { ExpiredTokenCleanupTask } from './expired-token-cleanup.task';
import { REFRESH_TOKEN_REPOSITORY_PORT } from '../../domain/ports/refresh-token-repository.port';

describe('ExpiredTokenCleanupTask', () => {
  let task: ExpiredTokenCleanupTask;
  let refreshTokenRepository: { deleteExpired: jest.Mock };

  beforeEach(async () => {
    refreshTokenRepository = { deleteExpired: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpiredTokenCleanupTask,
        { provide: REFRESH_TOKEN_REPOSITORY_PORT, useValue: refreshTokenRepository },
      ],
    }).compile();

    task = module.get<ExpiredTokenCleanupTask>(ExpiredTokenCleanupTask);
  });

  it('should be defined', () => {
    expect(task).toBeDefined();
  });

  describe('handleCleanup', () => {
    it('should call deleteExpired on the repository', async () => {
      refreshTokenRepository.deleteExpired.mockResolvedValue(undefined);

      await task.handleCleanup();

      expect(refreshTokenRepository.deleteExpired).toHaveBeenCalledTimes(1);
    });

    it('should not throw when deleteExpired fails', async () => {
      refreshTokenRepository.deleteExpired.mockRejectedValue(new Error('DB connection lost'));

      await expect(task.handleCleanup()).resolves.toBeUndefined();
      expect(refreshTokenRepository.deleteExpired).toHaveBeenCalledTimes(1);
    });
  });
});
