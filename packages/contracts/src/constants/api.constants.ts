export const API_BASE_PATH_SEGMENT = 'api';

export const API_BASE_PATH = `/${API_BASE_PATH_SEGMENT}`;

export const API_RESOURCE_PATHS = {
  AUTHENTICATION: 'authentication',
  HABITS: 'habits',
  TODAY: 'today',
  INSIGHTS: 'insights',
  PUSH_SUBSCRIPTIONS: 'push-subscriptions',
  NOTIFICATIONS: 'notifications',
  ANALYTICS_EVENTS: 'analytics-events',
  ANALYTICS_SUMMARY: 'analytics-summary',
  HEALTH: 'health',
} as const;

export const API_ROUTE_PARAMETERS = {
  IDENTIFIER: 'identifier',
  LOCAL_DATE: 'localDate',
} as const;

export const API_QUERY_PARAMETERS = {
  STATUS: 'status',
  FROM_LOCAL_DATE: 'fromLocalDate',
  TO_LOCAL_DATE: 'toLocalDate',
  LOCAL_DATE: 'localDate',
} as const;

export const HABIT_STATUS_QUERY_VALUES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  ALL: 'all',
} as const;

export const AUTHENTICATION_RESOURCE_ACTIONS = {
  REGISTRATION: 'register',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PROFILE: 'me',
} as const;

export const NOTIFICATION_RESOURCE_ACTIONS = {
  TEST: 'test',
  CONFIGURATION: 'configuration',
} as const;

export const HABIT_RESOURCE_ACTIONS = {
  LOGS: 'logs',
} as const;
