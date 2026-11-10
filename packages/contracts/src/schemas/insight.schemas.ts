import { z as zod } from 'zod';

import { localDateSchema } from './habit.schemas';

export const insightQuerySchema = zod.object({
  fromLocalDate: localDateSchema,
  toLocalDate: localDateSchema,
});

export const insightSummarySchema = zod.object({
  fromLocalDate: localDateSchema,
  toLocalDate: localDateSchema,
  overallCompletionRate: zod.number().min(0).max(100),
  completedCount: zod.number().int().min(0),
  dueCount: zod.number().int().min(0),
  activeHabitCount: zod.number().int().min(0),
  bestCurrentStreak: zod.number().int().min(0),
  dailySeries: zod.array(
    zod.object({
      localDate: localDateSchema,
      completedCount: zod.number().int().min(0),
      dueCount: zod.number().int().min(0),
    }),
  ),
  habitBreakdown: zod.array(
    zod.object({
      habitIdentifier: zod.string().uuid(),
      habitName: zod.string(),
      completionRate: zod.number().min(0).max(100),
      completedCount: zod.number().int().min(0),
      dueCount: zod.number().int().min(0),
      currentStreak: zod.number().int().min(0),
      longestStreak: zod.number().int().min(0),
    }),
  ),
});

export type InsightQuery = zod.infer<typeof insightQuerySchema>;
export type InsightSummary = zod.infer<typeof insightSummarySchema>;
