export const ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  AUTHENTICATION_SESSION_REVOKED: 'AUTHENTICATION_SESSION_REVOKED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_REGISTERED: 'EMAIL_ALREADY_REGISTERED',
  HABIT_NOT_FOUND: 'HABIT_NOT_FOUND',
  HABIT_LOG_NOT_FOUND: 'HABIT_LOG_NOT_FOUND',
  NOTIFICATION_SUBSCRIPTION_NOT_FOUND: 'NOTIFICATION_SUBSCRIPTION_NOT_FOUND',
  NOTIFICATIONS_NOT_CONFIGURED: 'NOTIFICATIONS_NOT_CONFIGURED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_FAILED: 'The submitted values are not valid.',
  UNAUTHENTICATED: 'You must sign in to continue.',
  AUTHENTICATION_SESSION_REVOKED: 'Your session has ended. Please sign in again.',
  INVALID_CREDENTIALS: 'The email address or password is incorrect.',
  EMAIL_ALREADY_REGISTERED: 'An account with this email address already exists.',
  HABIT_NOT_FOUND: 'The requested habit does not exist.',
  HABIT_LOG_NOT_FOUND: 'The requested habit log does not exist.',
  NOTIFICATION_SUBSCRIPTION_NOT_FOUND: 'The requested notification subscription does not exist.',
  NOTIFICATIONS_NOT_CONFIGURED: 'Push notifications are not configured on this server.',
  RESOURCE_NOT_FOUND: 'The requested resource does not exist.',
  RATE_LIMITED: 'Too many requests. Please wait before trying again.',
  INTERNAL_ERROR: 'An unexpected error occurred.',
};
