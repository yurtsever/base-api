import { HealthCheckResult } from '../models/health-status.model';

export interface HealthCheckPort {
  checkMemoryHeap(threshold: number): Promise<HealthCheckResult>;
  checkMemoryRSS(threshold: number): Promise<HealthCheckResult>;
  checkDiskStorage(path: string, threshold: number): Promise<HealthCheckResult>;
}

export const HEALTH_CHECK_PORT = Symbol('HEALTH_CHECK_PORT');
