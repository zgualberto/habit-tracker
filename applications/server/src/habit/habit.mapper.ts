import type { Habit } from '@habit-tracker/contracts';

import {
  calculateCurrentStreak,
  calculateLongestStreak,
} from '../domain/habit-streak.utility';
import type { HabitWithLogs } from './habit.repository';

export function toHabitResponse(habit: HabitWithLogs, referenceLocalDate: string): Habit {
  const completedLocalDates = habit.logs.map((log) => log.localDate);
  const schedule = {
    cadence: habit.cadence,
    weekdays: habit.weekdays,
    weeklyTarget: habit.weeklyTarget,
  };

  return {
    identifier: habit.identifier,
    name: habit.name,
    description: habit.description,
    cadence: habit.cadence,
    weekdays: habit.weekdays,
    weeklyTarget: habit.weeklyTarget,
    targetType: habit.targetType,
    targetValue: habit.targetValue,
    reminderTime: habit.reminderTime,
    archivedAt: habit.archivedAt?.toISOString() ?? null,
    createdAt: habit.createdAt.toISOString(),
    currentStreak: calculateCurrentStreak(schedule, completedLocalDates, referenceLocalDate),
    longestStreak: calculateLongestStreak(schedule, completedLocalDates, referenceLocalDate),
  };
}

export type HabitScheduleSource = {
  cadence: Habit['cadence'];
  weekdays: readonly number[];
  weeklyTarget: number | null;
};

export function toHabitSchedule(habit: HabitScheduleSource): HabitScheduleSource {
  return {
    cadence: habit.cadence,
    weekdays: habit.weekdays,
    weeklyTarget: habit.weeklyTarget,
  };
}
