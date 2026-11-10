<script setup lang="ts">
import { INSIGHT_RANGE_OPTIONS } from '../constants/presentation.constants';

const selectedDayCount = defineModel<number>({ required: true });

const emit = defineEmits<{ change: [dayCount: number] }>();

function handleChange(event: Event): void {
  const selectElement = event.target as HTMLSelectElement;
  const dayCount = Number(selectElement.value);
  selectedDayCount.value = dayCount;
  emit('change', dayCount);
}
</script>

<template>
  <label class="inline-flex items-center gap-2 text-sm text-slate-600">
    <span class="font-medium">Range</span>
    <select
      :value="selectedDayCount"
      class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
      @change="handleChange"
    >
      <option
        v-for="rangeOption in INSIGHT_RANGE_OPTIONS"
        :key="rangeOption.dayCount"
        :value="rangeOption.dayCount"
      >
        {{ rangeOption.label }}
      </option>
    </select>
  </label>
</template>
