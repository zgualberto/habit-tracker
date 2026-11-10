import { API_QUERY_PARAMETERS, type TodayResponse } from '@habit-tracker/contracts';

import { buildTodayApiPath } from '../constants/api-paths.utility';
import { apiRequest, buildQueryString } from './api-client';

export const todayService = {
  getToday(localDate: string): Promise<TodayResponse> {
    return apiRequest<TodayResponse>(
      `${buildTodayApiPath()}${buildQueryString({
        [API_QUERY_PARAMETERS.LOCAL_DATE]: localDate,
      })}`,
    );
  },
};
