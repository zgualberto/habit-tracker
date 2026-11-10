<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center"
  >
    <p class="text-base font-semibold text-slate-800">{{ title }}</p>
    <p class="max-w-md text-sm text-slate-500">{{ description }}</p>
    <div v-if="$slots.action" class="pt-2">
      <slot name="action" />
    </div>
  </div>
</template>
