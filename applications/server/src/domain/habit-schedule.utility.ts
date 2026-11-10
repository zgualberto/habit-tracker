import { WEEK_START_WEEKDAY, type HabitCadence } from '@habit-tracker/contracts';
import {
  addDaysToLocalDate,
  getStartOfWeekLocalDate,
  getWeekdayForLocalDate,
} from './local-date.utility';

export type HabitSchedule = {
  cadence: HabitCadence;
  weekdays: readonly number[];
  weeklyTarget: number | null;
};

export function isHabitScheduledOnLocalDate(schedule: HabitSchedule, localDate: string): boolean {
  if (schedule.cadence === 'DAILY') {
    return true;
  }

  if (schedule.cadence === 'WEEKDAYS') {
    return schedule.weekdays.includes(getWeekdayForLocalDate(localDate));
  }

  return true;
}

export function isHabitDueOnLocalDate(
  schedule: HabitSchedule,
  localDate: string,
  weeklyCompletedLocalDates: ReadonlySet<string>,
): boolean {
  if (!isHabitScheduledOnLocalDate(schedule, localDate)) {
    return false;
  }

  if (schedule.cadence !== 'WEEKLY_TARGET') {
    return true;
  }

  // A completed day is always due: it was the day the check-in happened.
  if (weeklyCompletedLocalDates.has(localDate)) {
    return true;
  }

  const weeklyTarget = schedule.weeklyTarget ?? 0;
  let completedCount = 0;
  for (const completedLocalDate of weeklyCompletedLocalDates) {
    if (completedLocalDate <= localDate) {
      completedCount += 1;
    }
  }

  return completedCount < weeklyTarget;
}

export function groupLocalDatesByWeek(localDates: Iterable<string>): Map<string, Set<string>> {
  const groupedLocalDates = new Map<string, Set<string>>();
  for (const localDate of localDates) {
    const weekStartLocalDate = getStartOfWeekLocalDate(localDate, WEEK_START_WEEKDAY);
    const existingGroup = groupedLocalDates.get(weekStartLocalDate);
    if (existingGroup === undefined) {
      groupedLocalDates.set(weekStartLocalDate, new Set([localDate]));
    } else {
      existingGroup.add(localDate);
    }
  }
  return groupedLocalDates;
}

export function getCompletedLocalDatesInWeek(
  completedLocalDates: Iterable<string>,
  localDate: string,
): Set<string> {
  const weekStartLocalDate = getStartOfWeekLocalDate(localDate, WEEK_START_WEEKDAY);
  const completedLocalDatesInWeek = new Set<string>();

  for (const completedLocalDate of completedLocalDates) {
    if (getStartOfWeekLocalDate(completedLocalDate, WEEK_START_WEEKDAY) === weekStartLocalDate) {
      completedLocalDatesInWeek.add(completedLocalDate);
    }
  }

  return completedLocalDatesInWeek;
}

export function countScheduledDaysInRange(
  schedule: HabitSchedule,
  fromLocalDate: string,
  toLocalDate: string,
): number {
  let scheduledDayCount = 0;
  let currentLocalDate = fromLocalDate;

  while (currentLocalDate <= toLocalDate) {
    if (isHabitScheduledOnLocalDate(schedule, currentLocalDate)) {
      scheduledDayCount += 1;
    }
    currentLocalDate = addDaysToLocalDate(currentLocalDate, 1);
  }

  return scheduledDayCount;
}
