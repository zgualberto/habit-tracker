import { Module } from '@nestjs/common';

import { AnalyticsEventController, AnalyticsSummaryController } from './analytics.controller';
import { AnalyticsRetentionScheduler } from './analytics-retention.scheduler';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsService } from './analytics.service';

@Module({
  controllers: [AnalyticsEventController, AnalyticsSummaryController],
  providers: [AnalyticsRepository, AnalyticsService, AnalyticsRetentionScheduler],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
