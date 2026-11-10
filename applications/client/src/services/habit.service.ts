import {
  buildHabitDetailApiPath,
  buildHabitLogApiPath,
  buildHabitLogListingApiPath,
  type CreateHabitRequest,
  type HabitListingResponse,
  type HabitLogListingResponse,
  type HabitLogQuery,
  type HabitLogResponse,
  type HabitResponse,
  type HabitStatus,
  type UpdateHabitRequest,
  type UpsertHabitLogRequest,
} from '@habit-tracker/contracts';

import { API_QUERY_PARAMETERS } from '@habit-tracker/contracts';

import { HTTP_METHODS } from '../constants/application.constants';
import { buildHabitsApiPath } from '../constants/api-paths.utility';
import { apiRequest, buildQueryString } from './api-client';

export const habitService = {
  listHabits(status: HabitStatus): Promise<HabitListingResponse> {
    return apiRequest<HabitListingResponse>(
      `${buildHabitsApiPath()}${buildQueryString({ [API_QUERY_PARAMETERS.STATUS]: status })}`,
    );
  },

  createHabit(request: CreateHabitRequest): Promise<HabitResponse> {
    return apiRequest<HabitResponse>(buildHabitsApiPath(), {
      method: HTTP_METHODS.POST,
      body: request,
    });
  },

  getHabit(habitIdentifier: string): Promise<HabitResponse> {
    return apiRequest<HabitResponse>(buildHabitDetailApiPath(habitIdentifier));
  },

  updateHabit(habitIdentifier: string, request: UpdateHabitRequest): Promise<HabitResponse> {
    return apiRequest<HabitResponse>(buildHabitDetailApiPath(habitIdentifier), {
      method: HTTP_METHODS.PATCH,
      body: request,
    });
  },

  archiveHabit(habitIdentifier: string): Promise<HabitResponse> {
    return apiRequest<HabitResponse>(buildHabitDetailApiPath(habitIdentifier), {
      method: HTTP_METHODS.DELETE,
    });
  },

  listLogs(habitIdentifier: string, query: HabitLogQuery = {}): Promise<HabitLogListingResponse> {
    return apiRequest<HabitLogListingResponse>(
      `${buildHabitLogListingApiPath(habitIdentifier)}${buildQueryString({
        [API_QUERY_PARAMETERS.FROM_LOCAL_DATE]: query.fromLocalDate,
        [API_QUERY_PARAMETERS.TO_LOCAL_DATE]: query.toLocalDate,
      })}`,
    );
  },

  upsertLog(
    habitIdentifier: string,
    localDate: string,
    request: UpsertHabitLogRequest,
  ): Promise<HabitLogResponse> {
    return apiRequest<HabitLogResponse>(buildHabitLogApiPath(habitIdentifier, localDate), {
      method: HTTP_METHODS.PUT,
      body: request,
    });
  },

  deleteLog(habitIdentifier: string, localDate: string): Promise<void> {
    return apiRequest<void>(buildHabitLogApiPath(habitIdentifier, localDate), {
      method: HTTP_METHODS.DELETE,
    });
  },
};
