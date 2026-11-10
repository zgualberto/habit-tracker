import { Injectable } from '@nestjs/common';

import { HABIT_STATISTICS_HISTORY_IN_DAYS, type TodayResponse } from '@habit-tracker/contracts';

import type { AuthenticatedUser } from '../common/types/authenticated-request.type';
import { addDaysToLocalDate } from '../domain/local-date.utility';
import {
  getCompletedLocalDatesInWeek,
  isHabitDueOnLocalDate,
} from '../domain/habit-schedule.utility';
import { toHabitResponse } from './habit.mapper';
import { HabitRepository } from './habit.repository';

@Injectable()
export class TodayService {
  public constructor(private readonly habitRepository: HabitRepository) {}

  public async getToday(
    authenticatedUser: AuthenticatedUser,
    localDate: string,
  ): Promise<TodayResponse> {
    const historyStartLocalDate = addDaysToLocalDate(localDate, -HABIT_STATISTICS_HISTORY_IN_DAYS);
    const habits = await this.habitRepository.findManyWithLogs({
      userIdentifier: authenticatedUser.identifier,
      status: 'active',
      logsFromLocalDate: historyStartLocalDate,
    });

    const habitEntries = habits.map((habit) => {
      const completedLocalDates = new Set(habit.logs.map((log) => log.localDate));
      const weeklyCompletedLocalDates = getCompletedLocalDatesInWeek(
        completedLocalDates,
        localDate,
      );
      const isDue = isHabitDueOnLocalDate(
        {
          cadence: habit.cadence,
          weekdays: habit.weekdays,
          weeklyTarget: habit.weeklyTarget,
        },
        localDate,
        weeklyCompletedLocalDates,
      );
      const log = habit.logs.find((habitLog) => habitLog.localDate === localDate) ?? null;

      return {
        habit: toHabitResponse(habit, localDate),
        log:
          log === null
            ? null
            : {
                identifier: log.identifier,
                habitIdentifier: log.habitIdentifier,
                localDate: log.localDate,
                completionValue: log.completionValue,
                note: log.note,
                createdAt: log.createdAt.toISOString(),
                updatedAt: log.updatedAt.toISOString(),
              },
        isDue,
        isCompleted: log !== null,
      };
    });

    const visibleHabitEntries = habitEntries.filter(
      (habitEntry) => habitEntry.isDue || habitEntry.isCompleted,
    );

    return {
      localDate,
      habits: visibleHabitEntries,
      dueCount: visibleHabitEntries.filter((habitEntry) => habitEntry.isDue).length,
      completedCount: visibleHabitEntries.filter((habitEntry) => habitEntry.isCompleted).length,
    };
  }
}
