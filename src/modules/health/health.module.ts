import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

// Domain
import { HealthDomainService } from './domain/services/health.service';
import { HEALTH_CHECK_PORT } from './domain/ports/health-check.port';

// Application
import { CHECK_OVERALL_HEALTH, CHECK_LIVENESS, CHECK_READINESS } from './application/ports/check-health.use-case';
import { CheckOverallHealthUseCase } from './application/use-cases/check-overall-health.use-case';
import { CheckLivenessUseCase } from './application/use-cases/check-liveness.use-case';
import { CheckReadinessUseCase } from './application/use-cases/check-readiness.use-case';

// Infrastructure
import { TerminusHealthCheckAdapter } from './infrastructure/adapters/terminus-health-check.adapter';
import { HealthController } from './infrastructure/controllers/health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [
    // Domain Services
    HealthDomainService,

    // Output Adapters (implementing Ports)
    {
      provide: HEALTH_CHECK_PORT,
      useClass: TerminusHealthCheckAdapter,
    },

    // Use Cases (Input Ports)
    {
      provide: CHECK_OVERALL_HEALTH,
      useClass: CheckOverallHealthUseCase,
    },
    {
      provide: CHECK_LIVENESS,
      useClass: CheckLivenessUseCase,
    },
    {
      provide: CHECK_READINESS,
      useClass: CheckReadinessUseCase,
    },
  ],
})
export class HealthModule {}
