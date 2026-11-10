<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';

import { buildHabitDetailRoutePath } from '@habit-tracker/contracts';

import BaseCard from '../components/BaseCard.vue';
import DateRangeSelector from '../components/DateRangeSelector.vue';
import EmptyState from '../components/EmptyState.vue';
import LineChart from '../components/LineChart.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import MetricCard from '../components/MetricCard.vue';
import PageAnalyticsCard from '../components/PageAnalyticsCard.vue';
import PageHeader from '../components/PageHeader.vue';
import ProgressBar from '../components/ProgressBar.vue';
import {
  CHART_COLORS,
  PERCENTAGE_PRECISION,
} from '../constants/presentation.constants';
import { useAnalyticsStore } from '../stores/analytics.store';
import { useAuthenticationStore } from '../stores/authentication.store';
import { useInsightStore } from '../stores/insight.store';
import { useToastStore } from '../stores/toast.store';
import { toUserMessage } from '../utilities/error.utility';
import { formatShortLocalDate } from '../utilities/local-date.utility';

const authenticationStore = useAuthenticationStore();
const insightStore = useInsightStore();
const analyticsStore = useAnalyticsStore();
const toastStore = useToastStore();

const {
  summary,
  selectedRangeInDays,
  isLoading: isInsightLoading,
} = storeToRefs(insightStore);
const { summary: analyticsSummary, isLoading: isAnalyticsLoading } = storeToRefs(analyticsStore);

const timeZone = computed(() => authenticationStore.user?.timeZone ?? 'UTC');

const chartLabels = computed(() =>
  (summary.value?.dailySeries ?? []).map((dailyEntry) => formatShortLocalDate(dailyEntry.localDate)),
);

const completedSeries = computed(() =>
  (summary.value?.dailySeries ?? []).map((dailyEntry) => dailyEntry.completedCount),
);

const dueSeries = computed(() =>
  (summary.value?.dailySeries ?? []).map((dailyEntry) => dailyEntry.dueCount),
);

const completionRateLabel = computed(() => {
  const completionRate = summary.value?.overallCompletionRate ?? 0;
  return `${completionRate.toFixed(PERCENTAGE_PRECISION)}%`;
});

async function loadInsights(): Promise<void> {
  try {
    await Promise.all([
      insightStore.loadSummary(timeZone.value),
      analyticsStore.loadSummary(timeZone.value, selectedRangeInDays.value),
    ]);
  } catch (error) {
    toastStore.pushToast('error', toUserMessage(error));
  }
}

async function handleRangeChange(): Promise<void> {
  await loadInsights();
}

onMounted(loadInsights);
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Insights"
      description="See how consistently you are showing up, and how people move through the app."
    >
      <template #actions>
        <DateRangeSelector v-model="selectedRangeInDays" @change="handleRangeChange" />
      </template>
    </PageHeader>

    <div v-if="isInsightLoading && summary === null" class="flex justify-center py-16">
      <LoadingSpinner />
    </div>

    <EmptyState
      v-else-if="summary === null"
      title="No insight data"
      description="Create a habit and check in to start building your history."
    />

    <template v-else>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Completion rate"
          :value="completionRateLabel"
          helper-text="Across every scheduled habit"
        />
        <MetricCard
          label="Completions"
          :value="`${summary.completedCount} / ${summary.dueCount}`"
          helper-text="Completed vs scheduled"
        />
        <MetricCard
          label="Best current streak"
          :value="`${summary.bestCurrentStreak} days`"
          helper-text="Your strongest active habit"
        />
        <MetricCard
          label="Active habits"
          :value="String(summary.activeHabitCount)"
          helper-text="Currently tracked"
        />
      </div>

      <BaseCard>
        <template #title>Daily completion</template>
        <template #description>
          Completions compared with the habits that were scheduled each day.
        </template>
        <LineChart
          :labels="chartLabels"
          :series="[
            { label: 'Completed', color: CHART_COLORS.COMPLETED, values: completedSeries },
            { label: 'Scheduled', color: CHART_COLORS.DUE, values: dueSeries },
          ]"
          y-axis-title="Habits"
          :height-in-pixels="280"
        />
      </BaseCard>

      <BaseCard>
        <template #title>Habit breakdown</template>
        <template #description>Completion rate for each active habit.</template>

        <p v-if="summary.habitBreakdown.length === 0" class="text-sm text-slate-500">
          No active habits in this range.
        </p>

        <ul v-else class="divide-y divide-slate-100">
          <li
            v-for="habitEntry in summary.habitBreakdown"
            :key="habitEntry.habitIdentifier"
            class="space-y-2 py-4"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <RouterLink
                :to="buildHabitDetailRoutePath(habitEntry.habitIdentifier)"
                class="text-sm font-semibold text-slate-800 hover:text-brand-700"
              >
                {{ habitEntry.habitName }}
              </RouterLink>
              <span class="text-xs text-slate-500">
                {{ habitEntry.completedCount }} / {{ habitEntry.dueCount }} ·
                current {{ habitEntry.currentStreak }} · best {{ habitEntry.longestStreak }}
              </span>
            </div>
            <ProgressBar
              :percentage="habitEntry.completionRate"
              :label="`${habitEntry.completionRate.toFixed(PERCENTAGE_PRECISION)}% complete`"
            />
          </li>
        </ul>
      </BaseCard>

      <PageAnalyticsCard :summary="analyticsSummary" :is-loading="isAnalyticsLoading" />
    </template>
  </div>
</template>
