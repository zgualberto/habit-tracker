<script setup lang="ts">
import { computed } from 'vue';

import type { HabitLog } from '@habit-tracker/contracts';

import { EMPTY_HABIT_HISTORY_MESSAGE } from '../constants/presentation.constants';
import {
  calculateClientDayDifference,
  formatDisplayLocalDate,
  getClientLocalDate,
} from '../utilities/local-date.utility';

const properties = withDefaults(
  defineProps<{
    logs: readonly HabitLog[];
    timeZone?: string;
    maximumRowCount?: number;
  }>(),
  { timeZone: 'UTC', maximumRowCount: 20 },
);

const orderedLogs = computed(() =>
  [...properties.logs]
    .sort((firstLog, secondLog) => secondLog.localDate.localeCompare(firstLog.localDate))
    .slice(0, properties.maximumRowCount),
);

function describeRelativeDay(localDate: string): string {
  const dayDifference = calculateClientDayDifference(
    localDate,
    getClientLocalDate(properties.timeZone),
  );

  if (dayDifference === 0) {
    return 'Today';
  }
  if (dayDifference === 1) {
    return 'Yesterday';
  }
  return `${dayDifference} days ago`;
}
</script>

<template>
  <div>
    <p v-if="orderedLogs.length === 0" class="text-sm text-slate-500">
      {{ EMPTY_HABIT_HISTORY_MESSAGE }}
    </p>
    <ol v-else class="divide-y divide-slate-100">
      <li
        v-for="log in orderedLogs"
        :key="log.identifier"
        class="flex flex-wrap items-center justify-between gap-2 py-3"
      >
        <div>
          <p class="text-sm font-medium text-slate-800">
            {{ formatDisplayLocalDate(log.localDate) }}
          </p>
          <p class="text-xs text-slate-400">{{ describeRelativeDay(log.localDate) }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-brand-700">
            {{ log.completionValue }}
          </span>
          <span v-if="log.note !== null" class="max-w-xs truncate text-xs text-slate-500">
            {{ log.note }}
          </span>
        </div>
      </li>
    </ol>
  </div>
</template>
