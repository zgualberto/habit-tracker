import {
  API_QUERY_PARAMETERS,
  ANALYTICS_EVENT_NAMES,
  type AnalyticsEventRequest,
  type AnalyticsEventResponse,
  type AnalyticsQuery,
  type AnalyticsSummary,
} from '@habit-tracker/contracts';

import {
  buildAnalyticsEventsApiPath,
  buildAnalyticsSummaryApiPath,
} from '../constants/api-paths.utility';
import { HTTP_METHODS } from '../constants/application.constants';
import { apiRequest, buildQueryString } from './api-client';

export const analyticsService = {
  recordPageView(path: string, sessionIdentifier: string): Promise<AnalyticsEventResponse> {
    const request: AnalyticsEventRequest = {
      name: ANALYTICS_EVENT_NAMES.PAGE_VIEW,
      path,
      sessionIdentifier,
    };

    return apiRequest<AnalyticsEventResponse>(buildAnalyticsEventsApiPath(), {
      method: HTTP_METHODS.POST,
      body: request,
      suppressAuthenticationRedirect: true,
    });
  },

  getSummary(query: AnalyticsQuery = {}): Promise<AnalyticsSummary> {
    return apiRequest<AnalyticsSummary>(
      `${buildAnalyticsSummaryApiPath()}${buildQueryString({
        [API_QUERY_PARAMETERS.FROM_LOCAL_DATE]: query.fromLocalDate,
        [API_QUERY_PARAMETERS.TO_LOCAL_DATE]: query.toLocalDate,
      })}`,
    );
  },
};
