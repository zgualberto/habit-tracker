import {
  buildDailyCompletionSeries,
  calculateCompletionStatistics,
} from './habit-completion.utility';

const dailySchedule = { cadence: 'DAILY' as const, weekdays: [], weeklyTarget: null };

const weekdaySchedule = {
  cadence: 'WEEKDAYS' as const,
  weekdays: [1, 2, 3, 4, 5],
  weeklyTarget: null,
};

const weeklyTargetSchedule = {
  cadence: 'WEEKLY_TARGET' as const,
  weekdays: [],
  weeklyTarget: 2,
};

describe('habit completion statistics', () => {
  it('calculates the daily completion rate', () => {
    const completedLocalDates = [
      '2026-11-01',
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-06',
      '2026-11-07',
    ];

    expect(
      calculateCompletionStatistics(dailySchedule, completedLocalDates, '2026-11-01', '2026-11-10'),
    ).toEqual({ completedCount: 7, dueCount: 10, completionRate: 70 });
  });

  it('counts only weekdays as due for a weekday habit', () => {
    const completedLocalDates = ['2026-11-02', '2026-11-03', '2026-11-04'];

    expect(
      calculateCompletionStatistics(
        weekdaySchedule,
        completedLocalDates,
        '2026-11-02',
        '2026-11-08',
      ),
    ).toEqual({ completedCount: 3, dueCount: 5, completionRate: 60 });
  });

  it('uses the weekly target as the denominator', () => {
    const completedLocalDates = ['2026-11-02', '2026-11-04', '2026-11-09'];

    expect(
      calculateCompletionStatistics(
        weeklyTargetSchedule,
        completedLocalDates,
        '2026-11-02',
        '2026-11-15',
      ),
    ).toEqual({ completedCount: 3, dueCount: 4, completionRate: 75 });
  });

  it('ignores completions outside the requested range', () => {
    const completedLocalDates = ['2026-10-31', '2026-11-01', '2026-11-02'];

    expect(
      calculateCompletionStatistics(dailySchedule, completedLocalDates, '2026-11-01', '2026-11-02'),
    ).toEqual({ completedCount: 2, dueCount: 2, completionRate: 100 });
  });

  it('builds a daily series that stops counting weekly targets once met', () => {
    const completedLocalDates = new Set(['2026-11-09', '2026-11-10']);

    const dailySeries = buildDailyCompletionSeries(
      [{ schedule: weeklyTargetSchedule, completedLocalDates }],
      '2026-11-09',
      '2026-11-11',
    );

    expect(dailySeries).toEqual([
      { localDate: '2026-11-09', completedCount: 1, dueCount: 1 },
      { localDate: '2026-11-10', completedCount: 1, dueCount: 1 },
      { localDate: '2026-11-11', completedCount: 0, dueCount: 0 },
    ]);
  });

  it('summarises several habits per day', () => {
    const sources = [
      { schedule: dailySchedule, completedLocalDates: new Set(['2026-11-09']) },
      { schedule: weekdaySchedule, completedLocalDates: new Set(['2026-11-09']) },
    ];

    const dailySeries = buildDailyCompletionSeries(sources, '2026-11-09', '2026-11-10');

    expect(dailySeries).toEqual([
      { localDate: '2026-11-09', completedCount: 2, dueCount: 2 },
      { localDate: '2026-11-10', completedCount: 0, dueCount: 2 },
    ]);
  });
});
