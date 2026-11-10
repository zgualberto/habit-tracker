import { BadRequestException, Injectable } from '@nestjs/common';

import {
  ERROR_CODES,
  ERROR_MESSAGES,
  HABIT_INSIGHT_MAXIMUM_RANGE_IN_DAYS,
  HABIT_STATISTICS_HISTORY_IN_DAYS,
  type InsightQuery,
  type InsightSummary,
} from '@habit-tracker/contracts';

import type { AuthenticatedUser } from '../common/types/authenticated-request.type';
import {
  addDaysToLocalDate,
  calculateDayDifference,
  getCurrentLocalDate,
} from '../domain/local-date.utility';
import {
  buildDailyCompletionSeries,
  calculateCompletionStatistics,
} from '../domain/habit-completion.utility';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
} from '../domain/habit-streak.utility';
import { toHabitSchedule } from '../habit/habit.mapper';
import { HabitRepository } from '../habit/habit.repository';

@Injectable()
export class InsightService {
  public constructor(private readonly habitRepository: HabitRepository) {}

  public async getSummary(
    authenticatedUser: AuthenticatedUser,
    query: InsightQuery,
  ): Promise<InsightSummary> {
    this.validateRange(query);

    const currentLocalDate = getCurrentLocalDate(authenticatedUser.timeZone);
    const referenceLocalDate =
      query.toLocalDate > currentLocalDate ? currentLocalDate : query.toLocalDate;

    const habits = await this.habitRepository.findManyWithLogs({
      userIdentifier: authenticatedUser.identifier,
      status: 'active',
      logsFromLocalDate: addDaysToLocalDate(
        query.fromLocalDate,
        -HABIT_STATISTICS_HISTORY_IN_DAYS,
      ),
    });

    const completionSources = habits.map((habit) => ({
      schedule: toHabitSchedule(habit),
      completedLocalDates: new Set(habit.logs.map((log) => log.localDate)),
    }));

    const dailySeries = buildDailyCompletionSeries(
      completionSources,
      query.fromLocalDate,
      query.toLocalDate,
    );

    let completedCount = 0;
    let dueCount = 0;
    let bestCurrentStreak = 0;

    const habitBreakdown = habits.map((habit, habitIndex) => {
      const schedule = toHabitSchedule(habit);
      const completedLocalDates = completionSources[habitIndex]?.completedLocalDates ?? new Set();

      const statistics = calculateCompletionStatistics(
        schedule,
        completedLocalDates,
        query.fromLocalDate,
        query.toLocalDate,
      );
      const currentStreak = calculateCurrentStreak(
        schedule,
        completedLocalDates,
        referenceLocalDate,
      );
      const longestStreak = calculateLongestStreak(
        schedule,
        completedLocalDates,
        referenceLocalDate,
      );

      completedCount += statistics.completedCount;
      dueCount += statistics.dueCount;
      bestCurrentStreak = Math.max(bestCurrentStreak, currentStreak);

      return {
        habitIdentifier: habit.identifier,
        habitName: habit.name,
        completionRate: statistics.completionRate,
        completedCount: statistics.completedCount,
        dueCount: statistics.dueCount,
        currentStreak,
        longestStreak,
      };
    });

    return {
      fromLocalDate: query.fromLocalDate,
      toLocalDate: query.toLocalDate,
      overallCompletionRate: dueCount === 0 ? 0 : Math.round((completedCount / dueCount) * 1000) / 10,
      completedCount,
      dueCount,
      activeHabitCount: habits.length,
      bestCurrentStreak,
      dailySeries,
      habitBreakdown,
    };
  }

  private validateRange(query: InsightQuery): void {
    if (query.fromLocalDate > query.toLocalDate) {
      throw new BadRequestException({
        errorCode: ERROR_CODES.VALIDATION_FAILED,
        message: ERROR_MESSAGES.VALIDATION_FAILED,
        details: ['fromLocalDate: The start date must not be after the end date.'],
      });
    }

    if (
      calculateDayDifference(query.fromLocalDate, query.toLocalDate) >
      HABIT_INSIGHT_MAXIMUM_RANGE_IN_DAYS
    ) {
      throw new BadRequestException({
        errorCode: ERROR_CODES.VALIDATION_FAILED,
        message: ERROR_MESSAGES.VALIDATION_FAILED,
        details: [
          `The date range cannot exceed ${HABIT_INSIGHT_MAXIMUM_RANGE_IN_DAYS} days.`,
        ],
      });
    }
  }
}
