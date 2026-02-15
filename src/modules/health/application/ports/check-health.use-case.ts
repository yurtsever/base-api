import { HealthStatus } from '../../domain/models/health-status.model';

export interface CheckHealthUseCase {
  execute(): Promise<HealthStatus>;
}

export const CHECK_OVERALL_HEALTH = Symbol('CHECK_OVERALL_HEALTH');
export const CHECK_LIVENESS = Symbol('CHECK_LIVENESS');
export const CHECK_READINESS = Symbol('CHECK_READINESS');
