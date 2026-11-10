<script setup lang="ts">
import { WEEKDAY_LABELS, WEEKDAY_SHORT_LABELS } from '../constants/presentation.constants';

defineProps<{ errorMessage?: string }>();

const selectedWeekdays = defineModel<number[]>({ required: true });

function toggleWeekday(weekday: number): void {
  selectedWeekdays.value = selectedWeekdays.value.includes(weekday)
    ? selectedWeekdays.value.filter((selectedWeekday) => selectedWeekday !== weekday)
    : [...selectedWeekdays.value, weekday].sort(
        (firstWeekday, secondWeekday) => firstWeekday - secondWeekday,
      );
}
</script>

<template>
  <fieldset class="space-y-2">
    <legend class="text-sm font-medium text-slate-700">Weekdays</legend>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="(weekdayLabel, weekdayIndex) in WEEKDAY_SHORT_LABELS"
        :key="weekdayLabel"
        type="button"
        :aria-label="WEEKDAY_LABELS[weekdayIndex]"
        :aria-pressed="selectedWeekdays.includes(weekdayIndex)"
        class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
        :class="
          selectedWeekdays.includes(weekdayIndex)
            ? 'border-brand-600 bg-brand-600 text-white'
            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
        "
        @click="toggleWeekday(weekdayIndex)"
      >
        {{ weekdayLabel }}
      </button>
    </div>
    <p v-if="errorMessage !== undefined && errorMessage.length > 0" class="text-sm text-red-600">
      {{ errorMessage }}
    </p>
  </fieldset>
</template>
