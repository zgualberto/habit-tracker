import {
  addDaysToClientLocalDate,
  calculateClientDayDifference,
  formatDisplayLocalDate,
  getClientLocalDate,
} from './local-date.utility';

describe('local date utility', () => {
  it('resolves the calendar day in the requested time zone', () => {
    const moment = new Date('2026-11-10T17:30:00.000Z');

    expect(getClientLocalDate('Asia/Manila', moment)).toBe('2026-11-11');
    expect(getClientLocalDate('UTC', moment)).toBe('2026-11-10');
  });

  it('adds and subtracts calendar days without drifting across months', () => {
    expect(addDaysToClientLocalDate('2026-11-10', 5)).toBe('2026-11-15');
    expect(addDaysToClientLocalDate('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDaysToClientLocalDate('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('calculates the signed difference between two local dates', () => {
    expect(calculateClientDayDifference('2026-11-01', '2026-11-10')).toBe(9);
    expect(calculateClientDayDifference('2026-11-10', '2026-11-01')).toBe(-9);
  });

  it('formats a local date for display', () => {
    expect(formatDisplayLocalDate('2026-11-10')).toContain('November 10, 2026');
  });
});
