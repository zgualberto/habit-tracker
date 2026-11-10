import {
  API_QUERY_PARAMETERS,
  type InsightQuery,
  type InsightSummary,
} from '@habit-tracker/contracts';

import { buildInsightsApiPath } from '../constants/api-paths.utility';
import { apiRequest, buildQueryString } from './api-client';

export const insightService = {
  getSummary(query: InsightQuery): Promise<InsightSummary> {
    return apiRequest<InsightSummary>(
      `${buildInsightsApiPath()}${buildQueryString({
        [API_QUERY_PARAMETERS.FROM_LOCAL_DATE]: query.fromLocalDate,
        [API_QUERY_PARAMETERS.TO_LOCAL_DATE]: query.toLocalDate,
      })}`,
    );
  },
};
