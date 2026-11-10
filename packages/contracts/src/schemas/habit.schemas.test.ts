import { describe, expect, it } from 'vitest';

import {
  createHabitRequestSchema,
  habitLogParameterSchema,
  localDateSchema,
  reminderTimeSchema,
  upsertHabitLogRequestSchema,
} from './habit.schemas';

const validDailyHabit = {
  name: 'Morning run',
  cadence: 'DAILY' as const,
  targetType: 'BOOLEAN' as const,
};

describe('habit schemas', () => {
  it('applies defaults for a daily boolean habit', () => {
    const createHabitRequest = createHabitRequestSchema.parse(validDailyHabit);

    expect(createHabitRequest).toMatchObject({
      name: 'Morning run',
      weekdays: [],
      targetType: 'BOOLEAN',
    });
    expect(createHabitRequest.description).toBeUndefined();
    expect(createHabitRequest.weeklyTarget).toBeUndefined();
    expect(createHabitRequest.targetValue).toBeUndefined();
    expect(createHabitRequest.reminderTime).toBeUndefined();
  });

  it('requires a weekday selection for a weekday habit', () => {
    const validationResult = createHabitRequestSchema.safeParse({
      ...validDailyHabit,
      cadence: 'WEEKDAYS',
    });

    expect(validationResult.success).toBe(false);
    expect(validationResult.error?.issues[0]?.path).toEqual(['weekdays']);
  });

  it('rejects duplicate weekdays', () => {
    const validationResult = createHabitRequestSchema.safeParse({
      ...validDailyHabit,
      cadence: 'WEEKDAYS',
      weekdays: [1, 1, 3],
    });

    expect(validationResult.success).toBe(false);
    expect(validationResult.error?.issues[0]?.message).toBe(
      'The same weekday cannot be selected more than once.',
    );
  });

  it('requires a weekly target for a weekly habit', () => {
    const validationResult = createHabitRequestSchema.safeParse({
      ...validDailyHabit,
      cadence: 'WEEKLY_TARGET',
    });

    expect(validationResult.success).toBe(false);
    expect(validationResult.error?.issues[0]?.path).toEqual(['weeklyTarget']);
  });

  it('requires a target value for a counted habit', () => {
    const validationResult = createHabitRequestSchema.safeParse({
      ...validDailyHabit,
      targetType: 'COUNT',
    });

    expect(validationResult.success).toBe(false);
    expect(validationResult.error?.issues[0]?.path).toEqual(['targetValue']);
  });

  it('accepts a complete weekly counted habit', () => {
    const validationResult = createHabitRequestSchema.safeParse({
      name: 'Strength training',
      cadence: 'WEEKLY_TARGET',
      weeklyTarget: 3,
      targetType: 'COUNT',
      targetValue: 45,
      reminderTime: '18:30',
    });

    expect(validationResult.success).toBe(true);
  });

  it('validates calendar literals and reminder times', () => {
    expect(localDateSchema.safeParse('2026-11-10').success).toBe(true);
    expect(localDateSchema.safeParse('10-11-2026').success).toBe(false);
    expect(reminderTimeSchema.safeParse('06:30').success).toBe(true);
    expect(reminderTimeSchema.safeParse('24:00').success).toBe(false);
  });

  it('defaults a check-in value to one', () => {
    expect(upsertHabitLogRequestSchema.parse({}).completionValue).toBe(1);
  });

  it('validates the habit and local date route parameters together', () => {
    expect(
      habitLogParameterSchema.safeParse({
        identifier: '11111111-1111-4111-8111-111111111111',
        localDate: '2026-11-10',
      }).success,
    ).toBe(true);
    expect(
      habitLogParameterSchema.safeParse({
        identifier: 'not-a-uuid',
        localDate: '2026-11-10',
      }).success,
    ).toBe(false);
  });
});
