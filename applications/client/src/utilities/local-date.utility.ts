import { MILLISECONDS_PER_DAY } from '@habit-tracker/contracts';

export function getClientLocalDate(timeZone: string, moment: Date = new Date()): string {
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return dateFormatter.format(moment);
}

export function addDaysToClientLocalDate(localDate: string, dayCount: number): string {
  const localDateMoment = new Date(`${localDate}T00:00:00.000Z`);
  localDateMoment.setUTCDate(localDateMoment.getUTCDate() + dayCount);
  return localDateMoment.toISOString().slice(0, 'YYYY-MM-DD'.length);
}

export function formatDisplayLocalDate(localDate: string): string {
  const localDateMoment = new Date(`${localDate}T00:00:00.000Z`);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(localDateMoment);
}

export function formatShortLocalDate(localDate: string): string {
  const localDateMoment = new Date(`${localDate}T00:00:00.000Z`);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(localDateMoment);
}

export function calculateClientDayDifference(fromLocalDate: string, toLocalDate: string): number {
  const fromMoment = new Date(`${fromLocalDate}T00:00:00.000Z`).getTime();
  const toMoment = new Date(`${toLocalDate}T00:00:00.000Z`).getTime();
  return Math.round((toMoment - fromMoment) / MILLISECONDS_PER_DAY);
}

export function resolveBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
