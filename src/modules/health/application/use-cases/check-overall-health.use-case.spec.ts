import { Test, TestingModule } from '@nestjs/testing';
import { CheckOverallHealthUseCase } from './check-overall-health.use-case';
import { HealthDomainService } from '../../domain/services/health.service';
import { HealthStatus } from '../../domain/models/health-status.model';

describe('CheckOverallHealthUseCase', () => {
  let useCase: CheckOverallHealthUseCase;
  let mockHealthService: jest.Mocked<HealthDomainService>;

  beforeEach(async () => {
    mockHealthService = {
      checkOverallHealth: jest.fn(),
    } as unknown as jest.Mocked<HealthDomainService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckOverallHealthUseCase,
        {
          provide: HealthDomainService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    useCase = module.get<CheckOverallHealthUseCase>(CheckOverallHealthUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call health service checkOverallHealth', async () => {
    const mockStatus = new HealthStatus('ok', {}, new Date());
    mockHealthService.checkOverallHealth.mockResolvedValue(mockStatus);

    const result = await useCase.execute();

    expect(result).toBe(mockStatus);
    expect(mockHealthService.checkOverallHealth).toHaveBeenCalled();
  });
});
