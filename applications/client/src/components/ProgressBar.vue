<script setup lang="ts">
import { computed } from 'vue';

import { PERCENTAGE_MAXIMUM } from '../constants/presentation.constants';

const properties = withDefaults(defineProps<{ percentage: number; label?: string }>(), {
  label: '',
});

const clampedPercentage = computed(() =>
  Math.min(PERCENTAGE_MAXIMUM, Math.max(0, Math.round(properties.percentage))),
);
</script>

<template>
  <div class="space-y-1.5">
    <div v-if="label.length > 0" class="flex items-center justify-between text-xs font-medium text-slate-500">
      <span>{{ label }}</span>
      <span>{{ clampedPercentage }}%</span>
    </div>
    <div
      class="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
      role="progressbar"
      :aria-valuenow="clampedPercentage"
      aria-valuemin="0"
      :aria-valuemax="PERCENTAGE_MAXIMUM"
    >
      <div
        class="h-full rounded-full bg-brand-600 transition-[width] duration-300"
        :style="{ width: `${clampedPercentage}%` }"
      />
    </div>
  </div>
</template>
