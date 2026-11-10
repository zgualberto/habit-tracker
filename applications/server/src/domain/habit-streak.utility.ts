import { MILLISECONDS_PER_DAY, WEEK_START_WEEKDAY } from '@habit-tracker/contracts';
import {
  addDaysToLocalDate,
  enumerateLocalDates,
  getStartOfWeekLocalDate,
} from './local-date.utility';
import {
  groupLocalDatesByWeek,
  isHabitScheduledOnLocalDate,
  type HabitSchedule,
} from './habit-schedule.utility';

const MAXIMUM_WEEKDAY_SEARCH_IN_DAYS = 7;

const MAXIMUM_STREAK_HISTORY_IN_DAYS = 3660;

function getEarliestCompletedLocalDate(
  completedLocalDates: ReadonlySet<string>,
  fallbackLocalDate: string,
): string {
  let earliestLocalDate = fallbackLocalDate;
  for (const completedLocalDate of completedLocalDates) {
    if (completedLocalDate < earliestLocalDate) {
      earliestLocalDate = completedLocalDate;
    }
  }
  return earliestLocalDate;
}

function findScheduledLocalDateAtOrBefore(
  schedule: HabitSchedule,
  localDate: string,
  earliestLocalDate: string,
): string | null {
  let currentLocalDate = localDate;

  for (let dayOffset = 0; dayOffset < MAXIMUM_WEEKDAY_SEARCH_IN_DAYS; dayOffset += 1) {
    if (currentLocalDate < earliestLocalDate) {
      return null;
    }
    if (isHabitScheduledOnLocalDate(schedule, currentLocalDate)) {
      return currentLocalDate;
    }
    currentLocalDate = addDaysToLocalDate(currentLocalDate, -1);
  }

  return null;
}

function calculateDailyOrWeekdayCurrentStreak(
  schedule: HabitSchedule,
  completedLocalDates: ReadonlySet<string>,
  referenceLocalDate: string,
): number {
  const earliestLocalDate = getEarliestCompletedLocalDate(
    completedLocalDates,
    referenceLocalDate,
  );

  let searchFromLocalDate = referenceLocalDate;
  const isReferenceScheduled = isHabitScheduledOnLocalDate(schedule, referenceLocalDate);

  // Today is still in progress: an uncompleted scheduled day does not break the
  // streak until the day is over.
  if (!isReferenceScheduled || !completedLocalDates.has(referenceLocalDate)) {
    searchFromLocalDate = addDaysToLocalDate(referenceLocalDate, -1);
  }

  let streakLength = 0;
  let scheduledLocalDate = findScheduledLocalDateAtOrBefore(
    schedule,
    searchFromLocalDate,
    earliestLocalDate,
  );

  while (scheduledLocalDate !== null && completedLocalDates.has(scheduledLocalDate)) {
    streakLength += 1;
    scheduledLocalDate = findScheduledLocalDateAtOrBefore(
      schedule,
      addDaysToLocalDate(scheduledLocalDate, -1),
      earliestLocalDate,
    );
  }

  return streakLength;
}

function calculateDailyOrWeekdayLongestStreak(
  schedule: HabitSchedule,
  completedLocalDates: ReadonlySet<string>,
  referenceLocalDate: string,
): number {
  if (completedLocalDates.size === 0) {
    return 0;
  }

  const earliestCompletedLocalDate = getEarliestCompletedLocalDate(
    completedLocalDates,
    referenceLocalDate,
  );
  const historyStartLocalDate = addDaysToLocalDate(
    referenceLocalDate,
    -MAXIMUM_STREAK_HISTORY_IN_DAYS,
  );
  const startLocalDate =
    earliestCompletedLocalDate > historyStartLocalDate
      ? earliestCompletedLocalDate
      : historyStartLocalDate;

  let longestStreak = 0;
  let currentStreak = 0;

  for (const localDate of enumerateLocalDates(startLocalDate, referenceLocalDate)) {
    if (!isHabitScheduledOnLocalDate(schedule, localDate)) {
      continue;
    }

    if (completedLocalDates.has(localDate)) {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return longestStreak;
}

function calculateWeeklyTargetCurrentStreak(
  schedule: HabitSchedule,
  completedLocalDates: ReadonlySet<string>,
  referenceLocalDate: string,
): number {
  const weeklyTarget = schedule.weeklyTarget ?? 0;
  if (weeklyTarget <= 0) {
    return 0;
  }

  const completionsByWeek = groupLocalDatesByWeek(completedLocalDates);
  let weekStartLocalDate = getStartOfWeekLocalDate(referenceLocalDate, WEEK_START_WEEKDAY);

  // The current week is still in progress, so a not-yet-met target does not break
  // the streak; start counting from the previous week instead.
  if ((completionsByWeek.get(weekStartLocalDate)?.size ?? 0) < weeklyTarget) {
    weekStartLocalDate = addDaysToLocalDate(weekStartLocalDate, -7);
  }

  let streakLength = 0;
  while ((completionsByWeek.get(weekStartLocalDate)?.size ?? 0) >= weeklyTarget) {
    streakLength += 1;
    weekStartLocalDate = addDaysToLocalDate(weekStartLocalDate, -7);
  }

  return streakLength;
}

function calculateWeeklyTargetLongestStreak(
  schedule: HabitSchedule,
  completedLocalDates: ReadonlySet<string>,
): number {
  const weeklyTarget = schedule.weeklyTarget ?? 0;
  if (weeklyTarget <= 0) {
    return 0;
  }

  const completionsByWeek = groupLocalDatesByWeek(completedLocalDates);
  const completedWeekStarts = [...completionsByWeek.entries()]
    .filter(([, completedLocalDatesInWeek]) => completedLocalDatesInWeek.size >= weeklyTarget)
    .map(([weekStartLocalDate]) => weekStartLocalDate)
    .sort();

  let longestStreak = 0;
  let currentStreak = 0;
  let previousWeekStart: string | null = null;

  for (const weekStartLocalDate of completedWeekStarts) {
    if (
      previousWeekStart !== null &&
      calculateWeekDifference(previousWeekStart, weekStartLocalDate) === 1
    ) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    longestStreak = Math.max(longestStreak, currentStreak);
    previousWeekStart = weekStartLocalDate;
  }

  return longestStreak;
}

function calculateWeekDifference(fromWeekStart: string, toWeekStart: string): number {
  const fromMoment = new Date(`${fromWeekStart}T00:00:00.000Z`).getTime();
  const toMoment = new Date(`${toWeekStart}T00:00:00.000Z`).getTime();
  return Math.round((toMoment - fromMoment) / (7 * MILLISECONDS_PER_DAY));
}

export function calculateCurrentStreak(
  schedule: HabitSchedule,
  completedLocalDates: Iterable<string>,
  referenceLocalDate: string,
): number {
  const completedLocalDateSet = new Set(completedLocalDates);

  if (schedule.cadence === 'WEEKLY_TARGET') {
    return calculateWeeklyTargetCurrentStreak(
      schedule,
      completedLocalDateSet,
      referenceLocalDate,
    );
  }

  return calculateDailyOrWeekdayCurrentStreak(
    schedule,
    completedLocalDateSet,
    referenceLocalDate,
  );
}

export function calculateLongestStreak(
  schedule: HabitSchedule,
  completedLocalDates: Iterable<string>,
  referenceLocalDate: string,
): number {
  const completedLocalDateSet = new Set(completedLocalDates);

  if (schedule.cadence === 'WEEKLY_TARGET') {
    return calculateWeeklyTargetLongestStreak(schedule, completedLocalDateSet);
  }

  return calculateDailyOrWeekdayLongestStreak(
    schedule,
    completedLocalDateSet,
    referenceLocalDate,
  );
}
