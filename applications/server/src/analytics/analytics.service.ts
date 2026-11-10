import { BadRequestException, Injectable } from '@nestjs/common';

import {
  ANALYTICS_DEFAULT_RANGE_IN_DAYS,
  ANALYTICS_MAXIMUM_RANGE_IN_DAYS,
  ANALYTICS_TOP_PATH_LIMIT,
  ERROR_CODES,
  ERROR_MESSAGES,
  type AnalyticsEventRequest,
  type AnalyticsEventResponse,
  type AnalyticsQuery,
  type AnalyticsSummary,
} from '@habit-tracker/contracts';

import type { AuthenticatedUser } from '../common/types/authenticated-request.type';
import {
  addDaysToLocalDate,
  calculateDayDifference,
  enumerateLocalDates,
  getCurrentLocalDate,
  isValidLocalDate,
} from '../domain/local-date.utility';
import { AnalyticsRepository } from './analytics.repository';

@Injectable()
export class AnalyticsService {
  public constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  public async recordEvent(
    authenticatedUser: AuthenticatedUser | undefined,
    request: AnalyticsEventRequest,
  ): Promise<AnalyticsEventResponse> {
    await this.analyticsRepository.create({
      userIdentifier: authenticatedUser?.identifier ?? null,
      sessionIdentifier: request.sessionIdentifier,
      name: request.name,
      path: request.path,
      metadata: request.metadata ?? null,
    });

    return { accepted: true };
  }

  public async getSummary(
    authenticatedUser: AuthenticatedUser,
    query: AnalyticsQuery,
  ): Promise<AnalyticsSummary> {
    const currentLocalDate = getCurrentLocalDate(authenticatedUser.timeZone);
    const toLocalDate = query.toLocalDate ?? currentLocalDate;
    const fromLocalDate =
      query.fromLocalDate ?? addDaysToLocalDate(toLocalDate, -ANALYTICS_DEFAULT_RANGE_IN_DAYS);

    this.validateRange(fromLocalDate, toLocalDate);

    const [totals, dailyRows, topPathRows] = await Promise.all([
      this.analyticsRepository.countTotals(
        authenticatedUser.identifier,
        authenticatedUser.timeZone,
        fromLocalDate,
        toLocalDate,
      ),
      this.analyticsRepository.findDailyPageViewCounts(
        authenticatedUser.identifier,
        authenticatedUser.timeZone,
        fromLocalDate,
        toLocalDate,
      ),
      this.analyticsRepository.findTopPaths(
        authenticatedUser.identifier,
        authenticatedUser.timeZone,
        fromLocalDate,
        toLocalDate,
        ANALYTICS_TOP_PATH_LIMIT,
      ),
    ]);

    const pageViewCountByLocalDate = new Map(
      dailyRows.map((dailyRow) => [dailyRow.localDate, dailyRow.pageViewCount]),
    );

    // Every day in the range is returned so the chart can render gaps as zero.
    const dailySeries = enumerateLocalDates(fromLocalDate, toLocalDate).map((localDate) => ({
      localDate,
      pageViewCount: pageViewCountByLocalDate.get(localDate) ?? 0,
    }));

    return {
      fromLocalDate,
      toLocalDate,
      totalPageViews: totals.totalPageViews,
      uniqueSessionCount: totals.uniqueSessionCount,
      dailySeries,
      topPaths: topPathRows,
    };
  }

  private validateRange(fromLocalDate: string, toLocalDate: string): void {
    if (!isValidLocalDate(fromLocalDate) || !isValidLocalDate(toLocalDate)) {
      throw this.buildValidationException('The date range contains an invalid date.');
    }

    if (fromLocalDate > toLocalDate) {
      throw this.buildValidationException(
        'fromLocalDate: The start date must not be after the end date.',
      );
    }

    if (calculateDayDifference(fromLocalDate, toLocalDate) > ANALYTICS_MAXIMUM_RANGE_IN_DAYS) {
      throw this.buildValidationException(
        `The date range cannot exceed ${ANALYTICS_MAXIMUM_RANGE_IN_DAYS} days.`,
      );
    }
  }

  private buildValidationException(detail: string): BadRequestException {
    return new BadRequestException({
      errorCode: ERROR_CODES.VALIDATION_FAILED,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      details: [detail],
    });
  }
}
