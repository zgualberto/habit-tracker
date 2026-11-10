<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value: string;
    helperText?: string;
  }>(),
  { helperText: '' },
);
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ label }}</p>
    <p class="mt-2 text-2xl font-bold text-slate-900">{{ value }}</p>
    <p v-if="helperText.length > 0" class="mt-1 text-xs text-slate-500">{{ helperText }}</p>
  </div>
</template>
