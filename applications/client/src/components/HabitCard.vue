<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import { HABIT_CADENCE_LABELS, WEEKDAY_SHORT_LABELS } from '../constants/presentation.constants';
import { buildHabitDetailRoutePath } from '@habit-tracker/contracts';
import type { Habit } from '@habit-tracker/contracts';
import BaseButton from './BaseButton.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import ProgressBar from './ProgressBar.vue';
import StreakBadge from './StreakBadge.vue';

const properties = withDefaults(
  defineProps<{
    habit: Habit;
    isCompleted?: boolean;
    isDue?: boolean;
    isUpdating?: boolean;
    completionValue?: number | null;
  }>(),
  { isCompleted: false, isDue: true, isUpdating: false, completionValue: null },
);

const emit = defineEmits<{ toggleCompletion: [] }>();

const scheduleDescription = computed(() => {
  if (properties.habit.cadence === 'WEEKDAYS') {
    const selectedWeekdayLabels = properties.habit.weekdays.map(
      (weekday) => WEEKDAY_SHORT_LABELS[weekday],
    );
    return selectedWeekdayLabels.length === 0
      ? HABIT_CADENCE_LABELS.WEEKDAYS
      : selectedWeekdayLabels.join(', ');
  }

  if (properties.habit.cadence === 'WEEKLY_TARGET') {
    return `${properties.habit.weeklyTarget ?? 0}x per week`;
  }

  return HABIT_CADENCE_LABELS.DAILY;
});

const targetDescription = computed(() => {
  if (properties.habit.targetType === 'COUNT' && properties.habit.targetValue !== null) {
    return `${properties.completionValue ?? 0} / ${properties.habit.targetValue}`;
  }
  return properties.isCompleted ? 'Completed' : 'Not done yet';
});

const completionPercentage = computed(() => {
  if (properties.habit.targetType !== 'COUNT' || properties.habit.targetValue === null) {
    return properties.isCompleted ? 100 : 0;
  }
  return ((properties.completionValue ?? 0) / properties.habit.targetValue) * 100;
});
</script>

<template>
  <article
    class="rounded-2xl border bg-white p-4 shadow-sm transition-colors sm:p-5"
    :class="isCompleted ? 'border-brand-200 bg-brand-50/50' : 'border-slate-200'"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex flex-wrap items-center gap-2">
          <RouterLink
            :to="buildHabitDetailRoutePath(habit.identifier)"
            class="truncate text-base font-semibold text-slate-900 hover:text-brand-700"
          >
            {{ habit.name }}
          </RouterLink>
          <StreakBadge :streak-in-days="habit.currentStreak" is-compact />
          <span
            v-if="!isDue"
            class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
          >
            Not scheduled today
          </span>
        </div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
          {{ scheduleDescription }}
        </p>
        <p v-if="habit.description !== null" class="text-sm text-slate-600">
          {{ habit.description }}
        </p>
      </div>

      <BaseButton
        v-if="isDue"
        :variant="isCompleted ? 'secondary' : 'primary'"
        :is-disabled="isUpdating"
        @click="emit('toggleCompletion')"
      >
        <LoadingSpinner v-if="isUpdating" size="small" />
        <span v-else>{{ isCompleted ? 'Undo' : 'Check in' }}</span>
      </BaseButton>
    </div>

    <div v-if="isDue" class="mt-4 space-y-1.5">
      <ProgressBar :percentage="completionPercentage" />
      <div class="flex items-center justify-between text-xs text-slate-500">
        <span>{{ targetDescription }}</span>
        <span>Best streak: {{ habit.longestStreak }} days</span>
      </div>
    </div>
  </article>
</template>
