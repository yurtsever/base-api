import { Test, TestingModule } from '@nestjs/testing';
import { MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { TerminusHealthCheckAdapter } from './terminus-health-check.adapter';

describe('TerminusHealthCheckAdapter', () => {
  let adapter: TerminusHealthCheckAdapter;
  let mockMemoryIndicator: any;
  let mockDiskIndicator: any;

  beforeEach(async () => {
    mockMemoryIndicator = {
      checkHeap: jest.fn(),
      checkRSS: jest.fn(),
    };

    mockDiskIndicator = {
      checkStorage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TerminusHealthCheckAdapter,
        {
          provide: MemoryHealthIndicator,
          useValue: mockMemoryIndicator,
        },
        {
          provide: DiskHealthIndicator,
          useValue: mockDiskIndicator,
        },
      ],
    }).compile();

    adapter = module.get<TerminusHealthCheckAdapter>(TerminusHealthCheckAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('checkMemoryHeap', () => {
    it('should return up status on success', async () => {
      const mockResult = { memory_heap: { status: 'up' } };
      mockMemoryIndicator.checkHeap.mockResolvedValue(mockResult);

      const result = await adapter.checkMemoryHeap(150 * 1024 * 1024);

      expect(result.status).toBe('up');
      expect(result.data).toBe(mockResult);
    });

    it('should return down status on failure', async () => {
      mockMemoryIndicator.checkHeap.mockRejectedValue(new Error('Memory exceeded'));

      const result = await adapter.checkMemoryHeap(150 * 1024 * 1024);

      expect(result.status).toBe('down');
      expect(result.message).toBe('Memory exceeded');
    });
  });

  describe('checkMemoryRSS', () => {
    it('should return up status on success', async () => {
      const mockResult = { memory_rss: { status: 'up' } };
      mockMemoryIndicator.checkRSS.mockResolvedValue(mockResult);

      const result = await adapter.checkMemoryRSS(300 * 1024 * 1024);

      expect(result.status).toBe('up');
    });
  });

  describe('checkDiskStorage', () => {
    it('should return up status on success', async () => {
      const mockResult = { storage: { status: 'up' } };
      mockDiskIndicator.checkStorage.mockResolvedValue(mockResult);

      const result = await adapter.checkDiskStorage('/', 0.9);

      expect(result.status).toBe('up');
      expect(mockDiskIndicator.checkStorage).toHaveBeenCalledWith('storage', {
        path: '/',
        thresholdPercent: 0.9,
      });
    });
  });
});
