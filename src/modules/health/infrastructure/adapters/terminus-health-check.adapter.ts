import { Injectable } from '@nestjs/common';
import { MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { HealthCheckPort } from '../../domain/ports/health-check.port';
import { HealthCheckResult } from '../../domain/models/health-status.model';

@Injectable()
export class TerminusHealthCheckAdapter implements HealthCheckPort {
  constructor(
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  async checkMemoryHeap(threshold: number): Promise<HealthCheckResult> {
    try {
      const result = await this.memory.checkHeap('memory_heap', threshold);
      return {
        status: 'up',
        data: result,
      };
    } catch (error: any) {
      return {
        status: 'down',
        message: error.message,
      };
    }
  }

  async checkMemoryRSS(threshold: number): Promise<HealthCheckResult> {
    try {
      const result = await this.memory.checkRSS('memory_rss', threshold);
      return {
        status: 'up',
        data: result,
      };
    } catch (error: any) {
      return {
        status: 'down',
        message: error.message,
      };
    }
  }

  async checkDiskStorage(path: string, threshold: number): Promise<HealthCheckResult> {
    try {
      const result = await this.disk.checkStorage('storage', {
        path,
        thresholdPercent: threshold,
      });
      return {
        status: 'up',
        data: result,
      };
    } catch (error: any) {
      return {
        status: 'down',
        message: error.message,
      };
    }
  }
}
