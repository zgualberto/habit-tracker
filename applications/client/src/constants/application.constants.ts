export const APPLICATION_NAME = 'Habit Tracker';

export const APPLICATION_DESCRIPTION =
  'Build habits, check in every day, and see how you are improving.';

export const APPLICATION_THEME_COLOR = '#047857';

export const APPLICATION_BACKGROUND_COLOR = '#f8fafc';

export const CLIENT_DEVELOPMENT_PORT = 5173;

export const SERVER_DEVELOPMENT_ORIGIN = 'http://localhost:3000';

export const CLIENT_STORAGE_KEYS = {
  ANALYTICS_SESSION_IDENTIFIER: 'habit_tracker_analytics_session_identifier',
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export const HTTP_HEADER_NAMES = {
  CONTENT_TYPE: 'Content-Type',
} as const;

export const HTTP_HEADER_VALUES = {
  JSON: 'application/json',
} as const;

export const HTTP_STATUS_CODES = {
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
} as const;

export const REQUEST_CREDENTIALS_MODE = 'include';

export const FIRST_ARRAY_INDEX = 0;

export const DEFAULT_PAGE_SIZE = 50;
