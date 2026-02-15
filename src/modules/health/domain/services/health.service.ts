import { Inject, Injectable } from '@nestjs/common';
import type { HealthCheckPort } from '../ports/health-check.port';
import { HEALTH_CHECK_PORT } from '../ports/health-check.port';
import { HealthStatus } from '../models/health-status.model';

@Injectable()
export class HealthDomainService {
  constructor(
    @Inject(HEALTH_CHECK_PORT)
    private readonly healthCheckPort: HealthCheckPort,
  ) {}

  async checkOverallHealth(): Promise<HealthStatus> {
    const checks = {
      memory_heap: await this.healthCheckPort.checkMemoryHeap(150 * 1024 * 1024),
      memory_rss: await this.healthCheckPort.checkMemoryRSS(300 * 1024 * 1024),
      storage: await this.healthCheckPort.checkDiskStorage('/', 0.9),
    };

    const allHealthy = Object.values(checks).every((c) => c.status === 'up');

    return new HealthStatus(allHealthy ? 'ok' : 'error', checks, new Date());
  }

  async checkLiveness(): Promise<HealthStatus> {
    const checks = {
      memory_heap: await this.healthCheckPort.checkMemoryHeap(150 * 1024 * 1024),
    };

    return new HealthStatus(checks.memory_heap.status === 'up' ? 'ok' : 'error', checks, new Date());
  }

  async checkReadiness(): Promise<HealthStatus> {
    const checks = {
      memory_rss: await this.healthCheckPort.checkMemoryRSS(300 * 1024 * 1024),
      storage: await this.healthCheckPort.checkDiskStorage('/', 0.9),
    };

    const allHealthy = Object.values(checks).every((c) => c.status === 'up');

    return new HealthStatus(allHealthy ? 'ok' : 'error', checks, new Date());
  }
}
