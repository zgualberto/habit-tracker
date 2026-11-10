<script setup lang="ts">
withDefaults(defineProps<{ streakInDays: number; isCompact?: boolean }>(), {
  isCompact: false,
});
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full bg-amber-50 font-semibold text-amber-700 ring-1 ring-amber-200"
    :class="isCompact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'"
    :title="`${streakInDays} day streak`"
  >
    <span aria-hidden="true">🔥</span>
    <span>{{ streakInDays }}</span>
    <span class="sr-only">day streak</span>
  </span>
</template>
