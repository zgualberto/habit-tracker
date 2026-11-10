import { calculateCurrentStreak, calculateLongestStreak } from './habit-streak.utility';

const dailySchedule = { cadence: 'DAILY' as const, weekdays: [], weeklyTarget: null };

const weekdaySchedule = {
  cadence: 'WEEKDAYS' as const,
  weekdays: [1, 3, 5],
  weeklyTarget: null,
};

const weeklyTargetSchedule = {
  cadence: 'WEEKLY_TARGET' as const,
  weekdays: [],
  weeklyTarget: 3,
};

describe('habit streaks', () => {
  describe('daily habits', () => {
    it('counts consecutive completed days', () => {
      const completedLocalDates = [
        '2026-11-01',
        '2026-11-02',
        '2026-11-03',
        '2026-11-04',
        '2026-11-05',
      ];

      expect(calculateCurrentStreak(dailySchedule, completedLocalDates, '2026-11-05')).toBe(5);
    });

    it('keeps the streak alive while today is still in progress', () => {
      const completedLocalDates = ['2026-11-07', '2026-11-08', '2026-11-09'];

      expect(calculateCurrentStreak(dailySchedule, completedLocalDates, '2026-11-10')).toBe(3);
    });

    it('breaks the streak when a past day is missing', () => {
      const completedLocalDates = ['2026-11-07', '2026-11-08', '2026-11-10'];

      expect(calculateCurrentStreak(dailySchedule, completedLocalDates, '2026-11-10')).toBe(1);
    });

    it('reports the longest streak even after a break', () => {
      const completedLocalDates = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-05'];

      expect(calculateCurrentStreak(dailySchedule, completedLocalDates, '2026-11-06')).toBe(1);
      expect(calculateLongestStreak(dailySchedule, completedLocalDates, '2026-11-06')).toBe(3);
    });

    it('returns zero without completions', () => {
      expect(calculateCurrentStreak(dailySchedule, [], '2026-11-10')).toBe(0);
      expect(calculateLongestStreak(dailySchedule, [], '2026-11-10')).toBe(0);
    });
  });

  describe('weekday habits', () => {
    it('counts only scheduled weekdays', () => {
      // 2026-11-02, 04, 06 are Monday, Wednesday, Friday.
      const completedLocalDates = ['2026-11-02', '2026-11-04', '2026-11-06', '2026-11-09'];

      expect(calculateCurrentStreak(weekdaySchedule, completedLocalDates, '2026-11-09')).toBe(4);
      expect(calculateLongestStreak(weekdaySchedule, completedLocalDates, '2026-11-12')).toBe(4);
    });

    it('skips unscheduled days without breaking the streak', () => {
      const completedLocalDates = ['2026-11-02', '2026-11-04', '2026-11-06'];

      expect(calculateCurrentStreak(weekdaySchedule, completedLocalDates, '2026-11-08')).toBe(3);
    });

    it('breaks when a scheduled weekday is missed', () => {
      const completedLocalDates = ['2026-11-02', '2026-11-06'];

      expect(calculateCurrentStreak(weekdaySchedule, completedLocalDates, '2026-11-06')).toBe(1);
    });
  });

  describe('weekly target habits', () => {
    it('counts consecutive weeks that met the target', () => {
      const completedLocalDates = [
        // Week of 2026-11-02: three completions.
        '2026-11-02',
        '2026-11-04',
        '2026-11-06',
        // Week of 2026-11-09: three completions.
        '2026-11-09',
        '2026-11-10',
        '2026-11-11',
      ];

      expect(calculateCurrentStreak(weeklyTargetSchedule, completedLocalDates, '2026-11-11')).toBe(
        2,
      );
      expect(calculateLongestStreak(weeklyTargetSchedule, completedLocalDates, '2026-11-11')).toBe(
        2,
      );
    });

    it('does not break the streak while the current week is still in progress', () => {
      const completedLocalDates = ['2026-11-02', '2026-11-04', '2026-11-06', '2026-11-09'];

      expect(calculateCurrentStreak(weeklyTargetSchedule, completedLocalDates, '2026-11-10')).toBe(
        1,
      );
    });

    it('breaks after a week that missed the target', () => {
      const completedLocalDates = ['2026-10-26', '2026-10-27', '2026-10-28', '2026-11-02'];

      expect(calculateCurrentStreak(weeklyTargetSchedule, completedLocalDates, '2026-11-09')).toBe(
        0,
      );
    });
  });
});
