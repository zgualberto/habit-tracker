import argon2 from 'argon2';

import { AUTHENTICATION_RESOURCE_ACTIONS } from '@habit-tracker/contracts';

export const AUTHENTICATION_COOKIE_NAME = 'habit_tracker_authentication';

export const AUTHENTICATION_COOKIE_PATH = '/';

export const AUTHENTICATION_TOKEN_EXPIRATION_DURATION = '7d';

export const AUTHENTICATION_SESSION_DURATION_IN_DAYS = 7;

export const AUTHENTICATION_SESSION_DURATION_IN_MILLISECONDS =
  AUTHENTICATION_SESSION_DURATION_IN_DAYS * 24 * 60 * 60 * 1000;

export const AUTHENTICATION_SESSION_CLEANUP_CRON_EXPRESSION = '15 3 * * *';

export const AUTHENTICATION_SESSION_RETENTION_IN_DAYS = 30;

export const AUTHENTICATION_USER_AGENT_MAXIMUM_LENGTH = 300;

export const JWT_CLAIM_NAMES = {
  SESSION_IDENTIFIER: 'sessionIdentifier',
} as const;

export const JWT_TOKEN_PAYLOAD_KEYS = {
  SUBJECT: 'sub',
  SESSION_IDENTIFIER: 'sessionIdentifier',
} as const;

export const AUTHENTICATION_ROUTE_ACTIONS = AUTHENTICATION_RESOURCE_ACTIONS;

export const ARGON2_HASHING_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export const AUTHENTICATION_OUTCOMES = {
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  SESSION_REVOKED: 'session-revoked',
} as const;

export type AuthenticationOutcome =
  (typeof AUTHENTICATION_OUTCOMES)[keyof typeof AUTHENTICATION_OUTCOMES];
