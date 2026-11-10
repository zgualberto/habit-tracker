import {
  countScheduledDaysInRange,
  getCompletedLocalDatesInWeek,
  groupLocalDatesByWeek,
  isHabitDueOnLocalDate,
  isHabitScheduledOnLocalDate,
} from './habit-schedule.utility';

const weekdaySchedule = {
  cadence: 'WEEKDAYS' as const,
  weekdays: [1, 5],
  weeklyTarget: null,
};

const weeklyTargetSchedule = {
  cadence: 'WEEKLY_TARGET' as const,
  weekdays: [],
  weeklyTarget: 2,
};

describe('habit scheduling', () => {
  it('treats daily habits as scheduled every day', () => {
    const schedule = { cadence: 'DAILY' as const, weekdays: [], weeklyTarget: null };

    expect(isHabitScheduledOnLocalDate(schedule, '2026-11-10')).toBe(true);
    expect(countScheduledDaysInRange(schedule, '2026-11-01', '2026-11-10')).toBe(10);
  });

  it('matches the configured weekdays', () => {
    expect(isHabitScheduledOnLocalDate(weekdaySchedule, '2026-11-09')).toBe(true);
    expect(isHabitScheduledOnLocalDate(weekdaySchedule, '2026-11-13')).toBe(true);
    expect(isHabitScheduledOnLocalDate(weekdaySchedule, '2026-11-10')).toBe(false);
    expect(countScheduledDaysInRange(weekdaySchedule, '2026-11-02', '2026-11-15')).toBe(4);
  });

  it('keeps a weekly habit due until the target is met', () => {
    expect(isHabitDueOnLocalDate(weeklyTargetSchedule, '2026-11-09', new Set())).toBe(true);
    expect(
      isHabitDueOnLocalDate(
        weeklyTargetSchedule,
        '2026-11-10',
        new Set(['2026-11-09']),
      ),
    ).toBe(true);
    expect(
      isHabitDueOnLocalDate(
        weeklyTargetSchedule,
        '2026-11-11',
        new Set(['2026-11-09', '2026-11-10']),
      ),
    ).toBe(false);
    expect(
      isHabitDueOnLocalDate(
        weeklyTargetSchedule,
        '2026-11-12',
        new Set(['2026-11-09', '2026-11-10']),
      ),
    ).toBe(false);
  });

  it('groups completions by their Monday-based week', () => {
    const grouped = groupLocalDatesByWeek(['2026-11-09', '2026-11-11', '2026-11-16']);

    expect([...grouped.keys()]).toEqual(['2026-11-09', '2026-11-16']);
    expect([...grouped.get('2026-11-09') ?? []]).toEqual(['2026-11-09', '2026-11-11']);
  });

  it('returns only the completions of the week that contains the date', () => {
    const completedLocalDatesInWeek = getCompletedLocalDatesInWeek(
      ['2026-11-08', '2026-11-09', '2026-11-15', '2026-11-16'],
      '2026-11-10',
    );

    expect([...completedLocalDatesInWeek]).toEqual(['2026-11-09', '2026-11-15']);
  });
});
