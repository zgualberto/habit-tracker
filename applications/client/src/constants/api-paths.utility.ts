import { API_BASE_PATH, API_RESOURCE_PATHS } from '@habit-tracker/contracts';

export function buildResourceApiPath(resourcePath: string): string {
  return `${API_BASE_PATH}/${resourcePath}`;
}

export function buildAuthenticationApiPath(action: string): string {
  return `${buildResourceApiPath(API_RESOURCE_PATHS.AUTHENTICATION)}/${action}`;
}

export function buildHabitsApiPath(): string {
  return buildResourceApiPath(API_RESOURCE_PATHS.HABITS);
}

export function buildTodayApiPath(): string {
  return buildResourceApiPath(API_RESOURCE_PATHS.TODAY);
}

export function buildInsightsApiPath(): string {
  return buildResourceApiPath(API_RESOURCE_PATHS.INSIGHTS);
}

export function buildAnalyticsEventsApiPath(): string {
  return buildResourceApiPath(API_RESOURCE_PATHS.ANALYTICS_EVENTS);
}

export function buildAnalyticsSummaryApiPath(): string {
  return buildResourceApiPath(API_RESOURCE_PATHS.ANALYTICS_SUMMARY);
}

export function buildPushSubscriptionsApiPath(): string {
  return buildResourceApiPath(API_RESOURCE_PATHS.PUSH_SUBSCRIPTIONS);
}

export function buildNotificationsApiPath(action: string): string {
  return `${buildResourceApiPath(API_RESOURCE_PATHS.NOTIFICATIONS)}/${action}`;
}
