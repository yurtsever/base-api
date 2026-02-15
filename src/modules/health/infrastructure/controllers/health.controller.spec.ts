import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { CHECK_OVERALL_HEALTH, CHECK_LIVENESS, CHECK_READINESS } from '../../application/ports/check-health.use-case';
import { HealthStatus } from '../../domain/models/health-status.model';

describe('HealthController', () => {
  let controller: HealthController;
  let mockOverallHealthUseCase: any;
  let mockLivenessUseCase: any;
  let mockReadinessUseCase: any;

  beforeEach(async () => {
    mockOverallHealthUseCase = {
      execute: jest.fn(),
    };

    mockLivenessUseCase = {
      execute: jest.fn(),
    };

    mockReadinessUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: CHECK_OVERALL_HEALTH,
          useValue: mockOverallHealthUseCase,
        },
        {
          provide: CHECK_LIVENESS,
          useValue: mockLivenessUseCase,
        },
        {
          provide: CHECK_READINESS,
          useValue: mockReadinessUseCase,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status', async () => {
      const mockStatus = new HealthStatus('ok', {}, new Date());
      mockOverallHealthUseCase.execute.mockResolvedValue(mockStatus);

      const result = await controller.check();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('info');
      expect(mockOverallHealthUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('liveness', () => {
    it('should return liveness status', async () => {
      const mockStatus = new HealthStatus('ok', {}, new Date());
      mockLivenessUseCase.execute.mockResolvedValue(mockStatus);

      const result = await controller.liveness();

      expect(result).toHaveProperty('status');
      expect(mockLivenessUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('readiness', () => {
    it('should return readiness status', async () => {
      const mockStatus = new HealthStatus('ok', {}, new Date());
      mockReadinessUseCase.execute.mockResolvedValue(mockStatus);

      const result = await controller.readiness();

      expect(result).toHaveProperty('status');
      expect(mockReadinessUseCase.execute).toHaveBeenCalled();
    });
  });
});
