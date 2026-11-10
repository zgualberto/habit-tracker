import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

import { ANALYTICS_RETENTION_CRON_EXPRESSION } from '../common/constants/analytics.constants';
import { ENVIRONMENT_VARIABLE_NAMES } from '../common/constants/environment.constants';
import { MILLISECONDS_PER_DAY } from '@habit-tracker/contracts';
import { AnalyticsRepository } from './analytics.repository';

@Injectable()
export class AnalyticsRetentionScheduler {
  private readonly logger = new Logger(AnalyticsRetentionScheduler.name);

  public constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly configurationService: ConfigService,
  ) {}

  @Cron(ANALYTICS_RETENTION_CRON_EXPRESSION)
  public async deleteExpiredEvents(): Promise<void> {
    const retentionInDays = this.configurationService.getOrThrow<number>(
      ENVIRONMENT_VARIABLE_NAMES.ANALYTICS_RETENTION_IN_DAYS,
    );
    const cutoffMoment = new Date(Date.now() - retentionInDays * MILLISECONDS_PER_DAY);
    const deletedCount = await this.analyticsRepository.deleteEventsCreatedBefore(cutoffMoment);

    if (deletedCount > 0) {
      this.logger.log(
        `Deleted ${deletedCount} analytics events older than ${retentionInDays} days.`,
      );
    }
  }
}
