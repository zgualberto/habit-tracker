import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { API_RESOURCE_PATHS, ERROR_CODES, ERROR_MESSAGES } from '@habit-tracker/contracts';

import { HEALTH_STATUS } from '../common/constants/health.constants';
import { Public } from '../common/decorators/public.decorator';
import { HealthService, type HealthCheckResult } from './health.service';

@ApiTags('Health')
@Controller(API_RESOURCE_PATHS.HEALTH)
export class HealthController {
  public constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  public async check(): Promise<HealthCheckResult> {
    const healthCheckResult = await this.healthService.check();

    // The container health check relies on the status code, so an unreachable
    // database must fail the probe rather than return a healthy 200.
    if (healthCheckResult.status !== HEALTH_STATUS.HEALTHY) {
      throw new ServiceUnavailableException({
        errorCode: ERROR_CODES.INTERNAL_ERROR,
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      });
    }

    return healthCheckResult;
  }
}
