export const ANALYTICS_EVENT_NAMES = {
  PAGE_VIEW: 'page_view',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[keyof typeof ANALYTICS_EVENT_NAMES];

export const ANALYTICS_PAGE_PATH_MAXIMUM_LENGTH = 200;

export const ANALYTICS_SESSION_IDENTIFIER_MAXIMUM_LENGTH = 64;

export const ANALYTICS_DEFAULT_RANGE_IN_DAYS = 30;

export const ANALYTICS_MAXIMUM_RANGE_IN_DAYS = 366;

export const ANALYTICS_TOP_PATH_LIMIT = 10;
