<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-4">
    <div class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{{ title }}</h1>
      <p v-if="description !== undefined && description.length > 0" class="text-sm text-slate-500">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
