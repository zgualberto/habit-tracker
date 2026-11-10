<script setup lang="ts">
import { RouterLink } from 'vue-router';

import { APPLICATION_ROUTE_PATHS } from '@habit-tracker/contracts';

import { APPLICATION_NAME } from '../constants/application.constants';

defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-slate-100 px-4 py-10">
    <div class="w-full max-w-md space-y-6">
      <header class="space-y-2 text-center">
        <RouterLink
          :to="APPLICATION_ROUTE_PATHS.TODAY"
          class="inline-flex items-center gap-2 text-lg font-bold text-brand-700"
          :aria-label="`${APPLICATION_NAME} home`"
        >
          <span class="flex size-9 items-center justify-center rounded-xl bg-brand-700 text-white">
            ✓
          </span>
          {{ APPLICATION_NAME }}
        </RouterLink>
        <h1 class="text-2xl font-bold text-slate-900">{{ title }}</h1>
        <p class="text-sm text-slate-500">{{ description }}</p>
      </header>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <slot />
      </div>

      <p v-if="$slots.footer" class="text-center text-xs text-slate-500">
        <slot name="footer" />
      </p>
    </div>
  </div>
</template>
