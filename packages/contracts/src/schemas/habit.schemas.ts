import { z as zod } from 'zod';

import {
  HABIT_CADENCE_VALUES,
  HABIT_DESCRIPTION_MAXIMUM_LENGTH,
  HABIT_LOG_NOTE_MAXIMUM_LENGTH,
  HABIT_NAME_MAXIMUM_LENGTH,
  HABIT_STATUS_VALUES,
  HABIT_TARGET_TYPE_VALUES,
  HABIT_TARGET_VALUE_MAXIMUM,
  HABIT_TARGET_VALUE_MINIMUM,
  HABIT_WEEKLY_TARGET_MAXIMUM,
  HABIT_WEEKLY_TARGET_MINIMUM,
  LOCAL_DATE_PATTERN,
  REMINDER_TIME_PATTERN,
  WEEKDAY_MAXIMUM,
  WEEKDAY_MINIMUM,
} from '../constants/habit.constants';

export const habitCadenceSchema = zod.enum(HABIT_CADENCE_VALUES);

export const habitTargetTypeSchema = zod.enum(HABIT_TARGET_TYPE_VALUES);

export const habitStatusSchema = zod.enum(HABIT_STATUS_VALUES);

export const localDateSchema = zod
  .string()
  .regex(LOCAL_DATE_PATTERN, { message: 'The local date must use the YYYY-MM-DD format.' });

export const reminderTimeSchema = zod.string().regex(REMINDER_TIME_PATTERN, {
  message: 'The reminder time must use the 24-hour HH:mm format.',
});

const weekdaysSchema = zod
  .array(zod.number().int().min(WEEKDAY_MINIMUM).max(WEEKDAY_MAXIMUM))
  .max(7)
  .refine((weekdays) => new Set(weekdays).size === weekdays.length, {
    message: 'The same weekday cannot be selected more than once.',
  });

const sharedHabitFields = {
  name: zod.string().trim().min(1).max(HABIT_NAME_MAXIMUM_LENGTH),
  description: zod.string().trim().max(HABIT_DESCRIPTION_MAXIMUM_LENGTH).nullish(),
  cadence: habitCadenceSchema,
  weekdays: weekdaysSchema.default([]),
  weeklyTarget: zod
    .number()
    .int()
    .min(HABIT_WEEKLY_TARGET_MINIMUM)
    .max(HABIT_WEEKLY_TARGET_MAXIMUM)
    .nullish(),
  targetType: habitTargetTypeSchema.default('BOOLEAN'),
  targetValue: zod
    .number()
    .int()
    .min(HABIT_TARGET_VALUE_MINIMUM)
    .max(HABIT_TARGET_VALUE_MAXIMUM)
    .nullish(),
  reminderTime: reminderTimeSchema.nullish(),
};

type HabitRuleValues = {
  cadence: (typeof HABIT_CADENCE_VALUES)[number];
  weekdays: number[];
  weeklyTarget?: number | null;
  targetType: (typeof HABIT_TARGET_TYPE_VALUES)[number];
  targetValue?: number | null;
};

function addHabitRuleIssues(values: HabitRuleValues, context: zod.RefinementCtx): void {
  if (values.cadence === 'WEEKDAYS' && values.weekdays.length === 0) {
    context.addIssue({
      code: zod.ZodIssueCode.custom,
      path: ['weekdays'],
      message: 'At least one weekday must be selected for a weekday habit.',
    });
  }

  if (values.cadence === 'WEEKLY_TARGET' && values.weeklyTarget == null) {
    context.addIssue({
      code: zod.ZodIssueCode.custom,
      path: ['weeklyTarget'],
      message: 'A weekly target is required for a weekly habit.',
    });
  }

  if (values.targetType === 'COUNT' && values.targetValue == null) {
    context.addIssue({
      code: zod.ZodIssueCode.custom,
      path: ['targetValue'],
      message: 'A target value is required for a counted habit.',
    });
  }
}

export const createHabitRequestSchema = zod
  .object(sharedHabitFields)
  .superRefine(addHabitRuleIssues);

export const updateHabitRequestSchema = zod
  .object({
    name: sharedHabitFields.name.optional(),
    description: sharedHabitFields.description,
    cadence: sharedHabitFields.cadence.optional(),
    weekdays: weekdaysSchema.optional(),
    weeklyTarget: sharedHabitFields.weeklyTarget,
    targetType: sharedHabitFields.targetType.optional(),
    targetValue: sharedHabitFields.targetValue,
    reminderTime: sharedHabitFields.reminderTime,
  })
  .refine((values) => Object.values(values).some((value) => value !== undefined), {
    message: 'At least one habit field must be provided.',
  });

export const habitSchema = zod.object({
  identifier: zod.string().uuid(),
  name: zod.string(),
  description: zod.string().nullable(),
  cadence: habitCadenceSchema,
  weekdays: zod.array(zod.number().int()),
  weeklyTarget: zod.number().int().nullable(),
  targetType: habitTargetTypeSchema,
  targetValue: zod.number().int().nullable(),
  reminderTime: zod.string().nullable(),
  archivedAt: zod.string().datetime().nullable(),
  createdAt: zod.string().datetime(),
  currentStreak: zod.number().int().min(0),
  longestStreak: zod.number().int().min(0),
});

export const habitListingResponseSchema = zod.object({
  habits: zod.array(habitSchema),
});

export const habitResponseSchema = zod.object({
  habit: habitSchema,
});

export const habitLogSchema = zod.object({
  identifier: zod.string().uuid(),
  habitIdentifier: zod.string().uuid(),
  localDate: localDateSchema,
  completionValue: zod.number().int().min(0),
  note: zod.string().nullable(),
  createdAt: zod.string().datetime(),
  updatedAt: zod.string().datetime(),
});

export const habitLogListingResponseSchema = zod.object({
  logs: zod.array(habitLogSchema),
});

export const upsertHabitLogRequestSchema = zod.object({
  completionValue: zod.number().int().min(1).max(HABIT_TARGET_VALUE_MAXIMUM).default(1),
  note: zod.string().trim().max(HABIT_LOG_NOTE_MAXIMUM_LENGTH).nullish(),
});

export const habitLogResponseSchema = zod.object({
  log: habitLogSchema,
});

export const habitLogQuerySchema = zod.object({
  fromLocalDate: localDateSchema.optional(),
  toLocalDate: localDateSchema.optional(),
});

export const habitIdentifierParameterSchema = zod.object({
  identifier: zod.string().uuid(),
});

export const habitListingQuerySchema = zod.object({
  status: habitStatusSchema.default('active'),
});

export const todayResponseSchema = zod.object({
  localDate: localDateSchema,
  habits: zod.array(
    zod.object({
      habit: habitSchema,
      log: habitLogSchema.nullable(),
      isDue: zod.boolean(),
      isCompleted: zod.boolean(),
    }),
  ),
  dueCount: zod.number().int().min(0),
  completedCount: zod.number().int().min(0),
});

export const todayQuerySchema = zod.object({
  localDate: localDateSchema,
});

export type HabitCadence = zod.infer<typeof habitCadenceSchema>;
export type HabitTargetType = zod.infer<typeof habitTargetTypeSchema>;
export type HabitStatus = zod.infer<typeof habitStatusSchema>;
export type CreateHabitRequest = zod.infer<typeof createHabitRequestSchema>;
export type UpdateHabitRequest = zod.infer<typeof updateHabitRequestSchema>;
export type Habit = zod.infer<typeof habitSchema>;
export type HabitListingResponse = zod.infer<typeof habitListingResponseSchema>;
export type HabitResponse = zod.infer<typeof habitResponseSchema>;
export type HabitLog = zod.infer<typeof habitLogSchema>;
export type HabitLogListingResponse = zod.infer<typeof habitLogListingResponseSchema>;
export type HabitLogResponse = zod.infer<typeof habitLogResponseSchema>;
export type UpsertHabitLogRequest = zod.infer<typeof upsertHabitLogRequestSchema>;
export type HabitLogQuery = zod.infer<typeof habitLogQuerySchema>;
export type TodayResponse = zod.infer<typeof todayResponseSchema>;

export const habitLogParameterSchema = zod.object({
  identifier: zod.string().uuid(),
  localDate: localDateSchema,
});

export type HabitLogParameter = zod.infer<typeof habitLogParameterSchema>;
