import { MILLISECONDS_PER_DAY } from '@habit-tracker/contracts';

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const timeZoneFormatters = new Map<string, Intl.DateTimeFormat>();

function getTimeZoneFormatter(timeZone: string): Intl.DateTimeFormat {
  const existingFormatter = timeZoneFormatters.get(timeZone);
  if (existingFormatter !== undefined) {
    return existingFormatter;
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  timeZoneFormatters.set(timeZone, formatter);
  return formatter;
}

export function isValidLocalDate(localDate: string): boolean {
  if (!LOCAL_DATE_PATTERN.test(localDate)) {
    return false;
  }

  const parsedDate = parseLocalDate(localDate);
  return Number.isFinite(parsedDate.getTime()) && formatLocalDate(parsedDate) === localDate;
}

export function parseLocalDate(localDate: string): Date {
  return new Date(`${localDate}T00:00:00.000Z`);
}

export function formatLocalDate(date: Date): string {
  const year = date.getUTCFullYear().toString().padStart(4, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalDateForTimeZone(moment: Date, timeZone: string): string {
  const formatter = getTimeZoneFormatter(timeZone);
  const dateParts = formatter.formatToParts(moment);
  const year = dateParts.find((datePart) => datePart.type === 'year')?.value ?? '0000';
  const month = dateParts.find((datePart) => datePart.type === 'month')?.value ?? '00';
  const day = dateParts.find((datePart) => datePart.type === 'day')?.value ?? '00';
  return `${year}-${month}-${day}`;
}

export function getCurrentLocalDate(timeZone: string, currentMoment: Date = new Date()): string {
  return getLocalDateForTimeZone(currentMoment, timeZone);
}

export function addDaysToLocalDate(localDate: string, dayCount: number): string {
  const date = parseLocalDate(localDate);
  date.setUTCDate(date.getUTCDate() + dayCount);
  return formatLocalDate(date);
}

export function calculateDayDifference(fromLocalDate: string, toLocalDate: string): number {
  const fromMoment = parseLocalDate(fromLocalDate).getTime();
  const toMoment = parseLocalDate(toLocalDate).getTime();
  return Math.round((toMoment - fromMoment) / MILLISECONDS_PER_DAY);
}

export function enumerateLocalDates(fromLocalDate: string, toLocalDate: string): string[] {
  const dayCount = calculateDayDifference(fromLocalDate, toLocalDate);
  if (dayCount < 0) {
    return [];
  }

  const localDates: string[] = [];
  for (let dayIndex = 0; dayIndex <= dayCount; dayIndex += 1) {
    localDates.push(addDaysToLocalDate(fromLocalDate, dayIndex));
  }
  return localDates;
}

export function getWeekdayForLocalDate(localDate: string): number {
  return parseLocalDate(localDate).getUTCDay();
}

export function getStartOfWeekLocalDate(localDate: string, weekStartWeekday: number): string {
  const weekday = getWeekdayForLocalDate(localDate);
  const dayOffset = (weekday - weekStartWeekday + 7) % 7;
  return addDaysToLocalDate(localDate, -dayOffset);
}

export function isLocalDateWithinRange(
  localDate: string,
  fromLocalDate: string,
  toLocalDate: string,
): boolean {
  return localDate >= fromLocalDate && localDate <= toLocalDate;
}

export function isLocalDateRangeWithinMaximumDays(
  fromLocalDate: string,
  toLocalDate: string,
  maximumDayCount: number,
): boolean {
  return calculateDayDifference(fromLocalDate, toLocalDate) <= maximumDayCount;
}

export function getLocalTimeForTimeZone(moment: Date, timeZone: string): string {
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const timeParts = timeFormatter.formatToParts(moment);
  const hour = timeParts.find((timePart) => timePart.type === 'hour')?.value ?? '00';
  const minute = timeParts.find((timePart) => timePart.type === 'minute')?.value ?? '00';
  return `${hour}:${minute}`;
}
