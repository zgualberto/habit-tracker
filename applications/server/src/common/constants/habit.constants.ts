import { HABIT_RESOURCE_ACTIONS } from '@habit-tracker/contracts';

export const HABIT_ROUTE_ACTIONS = {
  LOGS: HABIT_RESOURCE_ACTIONS.LOGS,
} as const;

export const HABIT_QUERY_DEFAULTS = {
  STATUS: 'active',
} as const;

export const HABIT_ROUTE_TEMPLATES = {
  IDENTIFIER: ':identifier',
  LOGS: ':identifier/logs',
  LOG_ENTRY: ':identifier/logs/:localDate',
} as const;
