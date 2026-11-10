import { Injectable, Logger } from '@nestjs/common';

import { HEALTH_COMPONENT_STATUS, HEALTH_STATUS } from '../common/constants/health.constants';
import { PrismaService } from '../database/prisma.service';

export type HealthCheckResult = {
  status: (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS];
  database: (typeof HEALTH_COMPONENT_STATUS)[keyof typeof HEALTH_COMPONENT_STATUS];
  checkedAt: string;
};

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  public constructor(private readonly prismaService: PrismaService) {}

  public async check(): Promise<HealthCheckResult> {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return {
        status: HEALTH_STATUS.HEALTHY,
        database: HEALTH_COMPONENT_STATUS.REACHABLE,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        'Database health check failed.',
        error instanceof Error ? error.stack : String(error),
      );
      return {
        status: HEALTH_STATUS.UNHEALTHY,
        database: HEALTH_COMPONENT_STATUS.UNREACHABLE,
        checkedAt: new Date().toISOString(),
      };
    }
  }
}
