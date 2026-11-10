import {
  addDaysToLocalDate,
  calculateDayDifference,
  enumerateLocalDates,
  getLocalDateForTimeZone,
  getLocalTimeForTimeZone,
  getStartOfWeekLocalDate,
  getWeekdayForLocalDate,
  isValidLocalDate,
} from './local-date.utility';

describe('local date utilities', () => {
  it('resolves the calendar date in the requested time zone', () => {
    const moment = new Date('2026-01-01T00:30:00.000Z');

    expect(getLocalDateForTimeZone(moment, 'Asia/Manila')).toBe('2026-01-01');
    expect(getLocalDateForTimeZone(moment, 'America/Los_Angeles')).toBe('2025-12-31');
    expect(getLocalDateForTimeZone(moment, 'UTC')).toBe('2026-01-01');
  });

  it('handles the daylight saving time transition', () => {
    expect(
      getLocalDateForTimeZone(new Date('2026-03-08T04:59:00.000Z'), 'America/New_York'),
    ).toBe('2026-03-07');
    expect(
      getLocalDateForTimeZone(new Date('2026-03-08T06:30:00.000Z'), 'America/New_York'),
    ).toBe('2026-03-08');
  });

  it('resolves the wall-clock time in the requested time zone', () => {
    const moment = new Date('2026-01-01T00:30:00.000Z');

    expect(getLocalTimeForTimeZone(moment, 'Asia/Manila')).toBe('08:30');
    expect(getLocalTimeForTimeZone(moment, 'UTC')).toBe('00:30');
    expect(getLocalTimeForTimeZone(moment, 'America/Los_Angeles')).toBe('16:30');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDaysToLocalDate('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysToLocalDate('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDaysToLocalDate('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('enumerates an inclusive range', () => {
    expect(enumerateLocalDates('2026-11-08', '2026-11-11')).toEqual([
      '2026-11-08',
      '2026-11-09',
      '2026-11-10',
      '2026-11-11',
    ]);
    expect(enumerateLocalDates('2026-11-11', '2026-11-08')).toEqual([]);
  });

  it('validates calendar dates strictly', () => {
    expect(isValidLocalDate('2026-11-10')).toBe(true);
    expect(isValidLocalDate('2026-02-30')).toBe(false);
    expect(isValidLocalDate('2026-1-1')).toBe(false);
    expect(isValidLocalDate('not-a-date')).toBe(false);
  });

  it('computes the weekday and the Monday-based start of week', () => {
    expect(getWeekdayForLocalDate('2026-11-10')).toBe(2);
    expect(getStartOfWeekLocalDate('2026-11-10', 1)).toBe('2026-11-09');
    expect(getStartOfWeekLocalDate('2026-11-15', 1)).toBe('2026-11-09');
    expect(getStartOfWeekLocalDate('2026-11-15', 0)).toBe('2026-11-15');
  });

  it('computes day differences in both directions', () => {
    expect(calculateDayDifference('2026-11-01', '2026-11-10')).toBe(9);
    expect(calculateDayDifference('2026-11-10', '2026-11-01')).toBe(-9);
  });
});
