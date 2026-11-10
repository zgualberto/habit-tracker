import { API_BASE_PATH, API_RESOURCE_PATHS, API_ROUTE_PARAMETERS } from './api.constants';

export const APPLICATION_ROUTE_NAMES = {
  LOGIN: 'login',
  REGISTRATION: 'registration',
  TODAY: 'today',
  HABIT_CREATION: 'habit-creation',
  HABIT_DETAIL: 'habit-detail',
  HABIT_EDITING: 'habit-editing',
  INSIGHTS: 'insights',
  SETTINGS: 'settings',
  NOT_FOUND: 'not-found',
} as const;

export const APPLICATION_ROUTE_PATHS = {
  LOGIN: '/login',
  REGISTRATION: '/register',
  TODAY: '/',
  HABIT_CREATION: '/habits/new',
  HABIT_DETAIL: '/habits/:identifier',
  HABIT_EDITING: '/habits/:identifier/edit',
  INSIGHTS: '/insights',
  SETTINGS: '/settings',
} as const;

export function buildHabitDetailRoutePath(habitIdentifier: string): string {
  return `/habits/${encodeURIComponent(habitIdentifier)}`;
}

export function buildHabitEditingRoutePath(habitIdentifier: string): string {
  return `/habits/${encodeURIComponent(habitIdentifier)}/edit`;
}

export function buildHabitDetailApiPath(habitIdentifier: string): string {
  return `${API_BASE_PATH}/${API_RESOURCE_PATHS.HABITS}/${encodeURIComponent(habitIdentifier)}`;
}

export function buildHabitLogApiPath(habitIdentifier: string, localDate: string): string {
  return `${buildHabitDetailApiPath(habitIdentifier)}/logs/${encodeURIComponent(localDate)}`;
}

export function buildHabitLogListingApiPath(habitIdentifier: string): string {
  return `${buildHabitDetailApiPath(habitIdentifier)}/logs`;
}

export const HABIT_ROUTE_PARAMETER_NAME = API_ROUTE_PARAMETERS.IDENTIFIER;
