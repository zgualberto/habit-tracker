import { z as zod } from 'zod';

import {
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_PAGE_PATH_MAXIMUM_LENGTH,
  ANALYTICS_SESSION_IDENTIFIER_MAXIMUM_LENGTH,
} from '../constants/analytics.constants';
import { analyticsDateRangeSchema } from './analytics-range.schema';
import { localDateSchema } from './habit.schemas';

export const analyticsEventNameSchema = zod.enum([ANALYTICS_EVENT_NAMES.PAGE_VIEW]);

export const analyticsEventRequestSchema = zod.object({
  name: analyticsEventNameSchema,
  path: zod.string().trim().min(1).max(ANALYTICS_PAGE_PATH_MAXIMUM_LENGTH),
  sessionIdentifier: zod.string().trim().min(1).max(ANALYTICS_SESSION_IDENTIFIER_MAXIMUM_LENGTH),
  metadata: zod.record(zod.unknown()).optional(),
});

export const analyticsEventResponseSchema = zod.object({
  accepted: zod.boolean(),
});

export const analyticsQuerySchema = analyticsDateRangeSchema;

export const analyticsSummarySchema = zod.object({
  fromLocalDate: localDateSchema,
  toLocalDate: localDateSchema,
  totalPageViews: zod.number().int().min(0),
  uniqueSessionCount: zod.number().int().min(0),
  dailySeries: zod.array(
    zod.object({
      localDate: localDateSchema,
      pageViewCount: zod.number().int().min(0),
    }),
  ),
  topPaths: zod.array(
    zod.object({
      path: zod.string(),
      pageViewCount: zod.number().int().min(0),
    }),
  ),
});

export type AnalyticsEventRequest = zod.infer<typeof analyticsEventRequestSchema>;
export type AnalyticsEventResponse = zod.infer<typeof analyticsEventResponseSchema>;
export type AnalyticsQuery = zod.infer<typeof analyticsQuerySchema>;
export type AnalyticsSummary = zod.infer<typeof analyticsSummarySchema>;
