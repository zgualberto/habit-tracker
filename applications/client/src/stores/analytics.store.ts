import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { AnalyticsSummary } from '@habit-tracker/contracts';

import { analyticsService } from '../services/analytics.service';
import { getAnalyticsSessionIdentifier } from '../utilities/analytics-session.utility';
import {
  addDaysToClientLocalDate,
  getClientLocalDate,
} from '../utilities/local-date.utility';

export const useAnalyticsStore = defineStore('analytics', () => {
  const summary = ref<AnalyticsSummary | null>(null);
  const isLoading = ref(false);

  async function trackPageView(path: string): Promise<void> {
    try {
      await analyticsService.recordPageView(path, getAnalyticsSessionIdentifier());
    } catch {
      // Analytics must never interrupt the person using the application.
    }
  }

  async function loadSummary(timeZone: string, dayCount: number): Promise<void> {
    const currentLocalDate = getClientLocalDate(timeZone);
    const rangeStartLocalDate = addDaysToClientLocalDate(currentLocalDate, -(dayCount - 1));

    isLoading.value = true;
    try {
      summary.value = await analyticsService.getSummary({
        fromLocalDate: rangeStartLocalDate,
        toLocalDate: currentLocalDate,
      });
    } finally {
      isLoading.value = false;
    }
  }

  return {
    summary,
    isLoading,
    trackPageView,
    loadSummary,
  };
});
