import { resolveBrowserTimeZone } from './local-date.utility';

let cachedTimeZoneOptions: readonly string[] | null = null;

export function getTimeZoneOptions(): readonly string[] {
  if (cachedTimeZoneOptions !== null) {
    return cachedTimeZoneOptions;
  }

  const browserTimeZone = resolveBrowserTimeZone();
  const supportedTimeZones = Intl.supportedValuesOf('timeZone');
  cachedTimeZoneOptions = [
    browserTimeZone,
    ...supportedTimeZones.filter((timeZone) => timeZone !== browserTimeZone),
  ];
  return cachedTimeZoneOptions;
}
