export const TOAST_DURATION_IN_MILLISECONDS = 4_000;

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFORMATION: 'information',
} as const;

export const CHART_COLORS = {
  COMPLETED: '#059669',
  DUE: '#a7f3d0',
  PAGE_VIEWS: '#2563eb',
  GRID: '#e2e8f0',
  TEXT: '#475569',
} as const;

export const CHART_FILL_OPACITY = 0.15;

export const INSIGHT_RANGE_OPTIONS = [
  { label: 'Last 7 days', dayCount: 7 },
  { label: 'Last 30 days', dayCount: 30 },
  { label: 'Last 90 days', dayCount: 90 },
] as const;

export const DEFAULT_INSIGHT_RANGE_IN_DAYS = 30;

export const WEEKDAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const WEEKDAY_SHORT_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const HABIT_CADENCE_LABELS = {
  DAILY: 'Every day',
  WEEKDAYS: 'Selected weekdays',
  WEEKLY_TARGET: 'Weekly target',
} as const;

export const HABIT_TARGET_TYPE_LABELS = {
  BOOLEAN: 'Done or not done',
  COUNT: 'Count towards a target',
} as const;

export const PERCENTAGE_MAXIMUM = 100;

export const PERCENTAGE_PRECISION = 1;

export const COMPLETION_RATE_FRACTION_DIGITS = 0;

export const NOTIFICATION_PERMISSION_VALUES = {
  DEFAULT: 'default',
  GRANTED: 'granted',
  DENIED: 'denied',
} as const;

export const SERVICE_WORKER_PATH = '/serviceWorker.js';

export const NOTIFICATION_ICON_PATH = '/icon.svg';

export const NOTIFICATION_BADGE_PATH = '/icon.svg';

export const NOTIFICATION_CLICK_ACTION = 'open-application';

export const NOTIFICATION_TITLE_FALLBACK = 'Habit reminder';

export const NOTIFICATION_BODY_FALLBACK = 'You have a habit waiting for you.';

export const REQUEST_TIMEOUT_IN_MILLISECONDS = 15_000;

export const LOGIN_REDIRECT_QUERY_KEY = 'redirect';

export const ARCHIVE_CONFIRMATION_MESSAGE =
  'Archiving keeps the history but removes the habit from your daily list. Continue?';

export const EMPTY_HABIT_HISTORY_MESSAGE =
  'No check-ins yet. Complete the habit today to start your streak.';

export const HABIT_LOG_COMPLETION_INCREMENT = 1;
