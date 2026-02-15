import { Injectable } from '@nestjs/common';
import { HealthDomainService } from '../../domain/services/health.service';
import { HealthStatus } from '../../domain/models/health-status.model';
import { CheckHealthUseCase } from '../ports/check-health.use-case';

@Injectable()
export class CheckOverallHealthUseCase implements CheckHealthUseCase {
  constructor(private readonly healthService: HealthDomainService) {}

  async execute(): Promise<HealthStatus> {
    return this.healthService.checkOverallHealth();
  }
}
