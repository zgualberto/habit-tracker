import { CLIENT_STORAGE_KEYS } from '../constants/application.constants';

export function getAnalyticsSessionIdentifier(): string {
  const existingIdentifier = window.sessionStorage.getItem(
    CLIENT_STORAGE_KEYS.ANALYTICS_SESSION_IDENTIFIER,
  );

  if (existingIdentifier !== null && existingIdentifier.length > 0) {
    return existingIdentifier;
  }

  const sessionIdentifier = window.crypto.randomUUID();
  window.sessionStorage.setItem(
    CLIENT_STORAGE_KEYS.ANALYTICS_SESSION_IDENTIFIER,
    sessionIdentifier,
  );
  return sessionIdentifier;
}
