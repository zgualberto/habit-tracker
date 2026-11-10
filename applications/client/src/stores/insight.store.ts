import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { InsightSummary } from '@habit-tracker/contracts';

import { DEFAULT_INSIGHT_RANGE_IN_DAYS } from '../constants/presentation.constants';
import { insightService } from '../services/insight.service';
import {
  addDaysToClientLocalDate,
  getClientLocalDate,
} from '../utilities/local-date.utility';

export const useInsightStore = defineStore('insight', () => {
  const summary = ref<InsightSummary | null>(null);
  const selectedRangeInDays = ref(DEFAULT_INSIGHT_RANGE_IN_DAYS);
  const isLoading = ref(false);

  async function loadSummary(timeZone: string): Promise<void> {
    const currentLocalDate = getClientLocalDate(timeZone);
    const rangeStartLocalDate = addDaysToClientLocalDate(
      currentLocalDate,
      -(selectedRangeInDays.value - 1),
    );

    isLoading.value = true;
    try {
      summary.value = await insightService.getSummary({
        fromLocalDate: rangeStartLocalDate,
        toLocalDate: currentLocalDate,
      });
    } finally {
      isLoading.value = false;
    }
  }

  function setRange(dayCount: number): void {
    selectedRangeInDays.value = dayCount;
  }

  return {
    summary,
    selectedRangeInDays,
    isLoading,
    loadSummary,
    setRange,
  };
});
