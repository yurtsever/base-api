export class HealthStatus {
  constructor(
    public readonly status: 'ok' | 'error' | 'shutting_down',
    public readonly checks: Record<string, HealthCheckResult>,
    public readonly timestamp: Date,
  ) {}

  isHealthy(): boolean {
    return this.status === 'ok';
  }

  toJSON() {
    return {
      status: this.status,
      info: this.checks,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export interface HealthCheckResult {
  status: 'up' | 'down';
  message?: string;
  data?: Record<string, any>;
}
