import { Test, TestingModule } from '@nestjs/testing';
import { HealthDomainService } from './health.service';
import { HEALTH_CHECK_PORT, HealthCheckPort } from '../ports/health-check.port';
import { HealthCheckResult } from '../models/health-status.model';

describe('HealthDomainService', () => {
  let service: HealthDomainService;
  let mockHealthCheckPort: jest.Mocked<HealthCheckPort>;

  beforeEach(async () => {
    mockHealthCheckPort = {
      checkMemoryHeap: jest.fn(),
      checkMemoryRSS: jest.fn(),
      checkDiskStorage: jest.fn(),
    } as jest.Mocked<HealthCheckPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthDomainService,
        {
          provide: HEALTH_CHECK_PORT,
          useValue: mockHealthCheckPort,
        },
      ],
    }).compile();

    service = module.get<HealthDomainService>(HealthDomainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkOverallHealth', () => {
    it('should return ok status when all checks pass', async () => {
      const upResult: HealthCheckResult = { status: 'up' };
      mockHealthCheckPort.checkMemoryHeap.mockResolvedValue(upResult);
      mockHealthCheckPort.checkMemoryRSS.mockResolvedValue(upResult);
      mockHealthCheckPort.checkDiskStorage.mockResolvedValue(upResult);

      const result = await service.checkOverallHealth();

      expect(result.status).toBe('ok');
      expect(result.isHealthy()).toBe(true);
      expect(result.checks).toHaveProperty('memory_heap');
      expect(result.checks).toHaveProperty('memory_rss');
      expect(result.checks).toHaveProperty('storage');
    });

    it('should return error status when any check fails', async () => {
      mockHealthCheckPort.checkMemoryHeap.mockResolvedValue({ status: 'up' });
      mockHealthCheckPort.checkMemoryRSS.mockResolvedValue({ status: 'down' });
      mockHealthCheckPort.checkDiskStorage.mockResolvedValue({ status: 'up' });

      const result = await service.checkOverallHealth();

      expect(result.status).toBe('error');
      expect(result.isHealthy()).toBe(false);
    });
  });

  describe('checkLiveness', () => {
    it('should check only memory heap', async () => {
      mockHealthCheckPort.checkMemoryHeap.mockResolvedValue({ status: 'up' });

      const result = await service.checkLiveness();

      expect(result.status).toBe('ok');
      expect(mockHealthCheckPort.checkMemoryHeap).toHaveBeenCalledWith(150 * 1024 * 1024);
      expect(mockHealthCheckPort.checkMemoryRSS).not.toHaveBeenCalled();
      expect(mockHealthCheckPort.checkDiskStorage).not.toHaveBeenCalled();
    });
  });

  describe('checkReadiness', () => {
    it('should check memory RSS and disk', async () => {
      mockHealthCheckPort.checkMemoryRSS.mockResolvedValue({ status: 'up' });
      mockHealthCheckPort.checkDiskStorage.mockResolvedValue({ status: 'up' });

      const result = await service.checkReadiness();

      expect(result.status).toBe('ok');
      expect(mockHealthCheckPort.checkMemoryHeap).not.toHaveBeenCalled();
      expect(mockHealthCheckPort.checkMemoryRSS).toHaveBeenCalled();
      expect(mockHealthCheckPort.checkDiskStorage).toHaveBeenCalled();
    });
  });
});
