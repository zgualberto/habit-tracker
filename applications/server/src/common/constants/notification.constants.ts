import { NOTIFICATION_RESOURCE_ACTIONS } from '@habit-tracker/contracts';

export const REMINDER_SCHEDULER_CRON_EXPRESSION = '* * * * *';

export const REMINDER_NOTIFICATION_TITLE = 'Habit reminder';

export const REMINDER_NOTIFICATION_BODY_PREFIX = 'Time for';

export const TEST_NOTIFICATION_TITLE = 'Notifications are working';

export const TEST_NOTIFICATION_BODY =
  'This is a test notification from your habit tracker.';

export const EXPIRED_PUSH_SUBSCRIPTION_STATUS_CODES = [404, 410];

export const PUSH_SUBSCRIPTION_ENDPOINT_MAXIMUM_LENGTH = 2048;

export const NOTIFICATION_ROUTE_ACTIONS = {
  TEST: NOTIFICATION_RESOURCE_ACTIONS.TEST,
} as const;

export const PUSH_SUBSCRIPTION_ROUTE_TEMPLATES = {
  IDENTIFIER: ':identifier',
} as const;

export const NOTIFICATION_ROUTE_TEMPLATES = {
  TEST: NOTIFICATION_RESOURCE_ACTIONS.TEST,
  CONFIGURATION: NOTIFICATION_RESOURCE_ACTIONS.CONFIGURATION,
} as const;

export const REMINDER_NOTIFICATION_URL = '/';

export const REMINDER_NOTIFICATION_TAG_PREFIX = 'habit-reminder-';

export const TEST_NOTIFICATION_TAG = 'test-notification';

export const PUSH_NOTIFICATION_PAYLOAD_KEYS = {
  TITLE: 'title',
  BODY: 'body',
  URL: 'url',
  TAG: 'tag',
} as const;
