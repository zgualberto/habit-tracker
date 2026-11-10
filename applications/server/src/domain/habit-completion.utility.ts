import { WEEK_START_WEEKDAY } from '@habit-tracker/contracts';
import {
  addDaysToLocalDate,
  getStartOfWeekLocalDate,
} from './local-date.utility';
import {
  countScheduledDaysInRange,
  getCompletedLocalDatesInWeek,
  isHabitDueOnLocalDate,
  isHabitScheduledOnLocalDate,
  type HabitSchedule,
} from './habit-schedule.utility';

export type HabitCompletionStatistics = {
  completedCount: number;
  dueCount: number;
  completionRate: number;
};

export type HabitCompletionSource = {
  schedule: HabitSchedule;
  completedLocalDates: ReadonlySet<string>;
};

export type DailyCompletionPoint = {
  localDate: string;
  completedCount: number;
  dueCount: number;
};

function roundPercentage(value: number): number {
  const boundedValue = Math.min(100, Math.max(0, value));
  return Math.round(boundedValue * 10) / 10;
}

function countWeeksInRange(fromLocalDate: string, toLocalDate: string): number {
  let weekStartLocalDate = getStartOfWeekLocalDate(fromLocalDate, WEEK_START_WEEKDAY);
  let weekCount = 0;

  while (weekStartLocalDate <= toLocalDate) {
    weekCount += 1;
    weekStartLocalDate = addDaysToLocalDate(weekStartLocalDate, 7);
  }

  return weekCount;
}

export function calculateCompletionStatistics(
  schedule: HabitSchedule,
  completedLocalDates: Iterable<string>,
  fromLocalDate: string,
  toLocalDate: string,
): HabitCompletionStatistics {
  const completedLocalDatesInRange = new Set<string>();
  for (const completedLocalDate of completedLocalDates) {
    if (completedLocalDate >= fromLocalDate && completedLocalDate <= toLocalDate) {
      completedLocalDatesInRange.add(completedLocalDate);
    }
  }

  if (schedule.cadence === 'WEEKLY_TARGET') {
    const dueCount = countWeeksInRange(fromLocalDate, toLocalDate) * (schedule.weeklyTarget ?? 0);
    const completedCount = completedLocalDatesInRange.size;
    return {
      completedCount,
      dueCount,
      completionRate:
        dueCount === 0 ? 0 : roundPercentage((completedCount / dueCount) * 100),
    };
  }

  const dueCount = countScheduledDaysInRange(schedule, fromLocalDate, toLocalDate);
  let completedCount = 0;

  for (const completedLocalDate of completedLocalDatesInRange) {
    if (isHabitScheduledOnLocalDate(schedule, completedLocalDate)) {
      completedCount += 1;
    }
  }

  return {
    completedCount,
    dueCount,
    completionRate: dueCount === 0 ? 0 : roundPercentage((completedCount / dueCount) * 100),
  };
}

export function buildDailyCompletionSeries(
  sources: readonly HabitCompletionSource[],
  fromLocalDate: string,
  toLocalDate: string,
): DailyCompletionPoint[] {
  const dailySeries: DailyCompletionPoint[] = [];
  let currentLocalDate = fromLocalDate;

  while (currentLocalDate <= toLocalDate) {
    let completedCount = 0;
    let dueCount = 0;

    for (const source of sources) {
      const weeklyCompletedLocalDates = getCompletedLocalDatesInWeek(
        source.completedLocalDates,
        currentLocalDate,
      );
      const isDue = isHabitDueOnLocalDate(
        source.schedule,
        currentLocalDate,
        weeklyCompletedLocalDates,
      );

      if (!isDue) {
        continue;
      }

      dueCount += 1;
      if (source.completedLocalDates.has(currentLocalDate)) {
        completedCount += 1;
      }
    }

    dailySeries.push({ localDate: currentLocalDate, completedCount, dueCount });
    currentLocalDate = addDaysToLocalDate(currentLocalDate, 1);
  }

  return dailySeries;
}
