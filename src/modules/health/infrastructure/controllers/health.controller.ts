import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { CheckHealthUseCase } from '../../application/ports/check-health.use-case';
import { CHECK_OVERALL_HEALTH, CHECK_LIVENESS, CHECK_READINESS } from '../../application/ports/check-health.use-case';
import { Public } from '../../../iam/infrastructure/decorators/public.decorator';

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(
    @Inject(CHECK_OVERALL_HEALTH)
    private readonly checkOverallHealth: CheckHealthUseCase,
    @Inject(CHECK_LIVENESS)
    private readonly checkLiveness: CheckHealthUseCase,
    @Inject(CHECK_READINESS)
    private readonly checkReadiness: CheckHealthUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Overall health check',
    description: 'Returns overall health status including memory and disk',
  })
  async check() {
    const status = await this.checkOverallHealth.execute();
    return status.toJSON();
  }

  @Get('liveness')
  @ApiOperation({
    summary: 'Kubernetes liveness probe',
    description: 'Indicates if the application is running',
  })
  async liveness() {
    const status = await this.checkLiveness.execute();
    return status.toJSON();
  }

  @Get('readiness')
  @ApiOperation({
    summary: 'Kubernetes readiness probe',
    description: 'Indicates if the application is ready to accept traffic',
  })
  async readiness() {
    const status = await this.checkReadiness.execute();
    return status.toJSON();
  }
}
