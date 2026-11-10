<script setup lang="ts">
import { computed } from 'vue';

import type { AnalyticsSummary } from '@habit-tracker/contracts';

import { CHART_COLORS } from '../constants/presentation.constants';
import { formatShortLocalDate } from '../utilities/local-date.utility';
import BaseCard from './BaseCard.vue';
import EmptyState from './EmptyState.vue';
import LineChart from './LineChart.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import MetricCard from './MetricCard.vue';

const properties = withDefaults(
  defineProps<{
    summary: AnalyticsSummary | null;
    isLoading?: boolean;
  }>(),
  { isLoading: false },
);

const chartLabels = computed(() =>
  (properties.summary?.dailySeries ?? []).map((dailyEntry) =>
    formatShortLocalDate(dailyEntry.localDate),
  ),
);

const chartValues = computed(() =>
  (properties.summary?.dailySeries ?? []).map((dailyEntry) => dailyEntry.pageViewCount),
);

const hasPageViews = computed(() => (properties.summary?.totalPageViews ?? 0) > 0);
</script>

<template>
  <BaseCard>
    <template #title>Page analytics</template>
    <template #description>
      Signed-in page views recorded by this application, bucketed by your local day.
    </template>

    <div v-if="isLoading" class="flex justify-center py-10">
      <LoadingSpinner />
    </div>

    <div v-else-if="summary === null" class="py-6">
      <EmptyState
        title="No analytics loaded"
        description="Open the insights screen again to load your page analytics."
      />
    </div>

    <div v-else class="space-y-5">
      <div class="grid gap-3 sm:grid-cols-2">
        <MetricCard
          label="Total page views"
          :value="String(summary.totalPageViews)"
          helper-text="In the selected range"
        />
        <MetricCard
          label="Unique sessions"
          :value="String(summary.uniqueSessionCount)"
          helper-text="Distinct browser sessions"
        />
      </div>

      <div v-if="!hasPageViews" class="py-2">
        <EmptyState
          title="No page views yet"
          description="Browse a few screens and your analytics will appear here."
        />
      </div>

      <template v-else>
        <LineChart
          :labels="chartLabels"
          :series="[{ label: 'Page views', color: CHART_COLORS.PAGE_VIEWS, values: chartValues }]"
          y-axis-title="Page views"
          :height-in-pixels="220"
        />

        <section aria-labelledby="top-paths-heading">
          <h3 id="top-paths-heading" class="mb-2 text-sm font-semibold text-slate-700">
            Most visited pages
          </h3>
          <ol class="divide-y divide-slate-100">
            <li
              v-for="topPath in summary.topPaths"
              :key="topPath.path"
              class="flex items-center justify-between gap-3 py-2"
            >
              <code class="truncate rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                {{ topPath.path }}
              </code>
              <span class="text-sm font-semibold text-slate-700">{{ topPath.pageViewCount }}</span>
            </li>
          </ol>
        </section>
      </template>
    </div>
  </BaseCard>
</template>
