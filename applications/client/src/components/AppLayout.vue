<script setup lang="ts">
import { RouterLink } from 'vue-router';

import { APPLICATION_ROUTE_NAMES } from '@habit-tracker/contracts';

import AppNavigation from './AppNavigation.vue';

const currentYear = new Date().getFullYear();
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-slate-50">
    <AppNavigation />

    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <slot />
    </main>

    <footer class="border-t border-slate-200 bg-white">
      <div
        class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-slate-400 sm:px-6"
      >
        <span>© {{ currentYear }} Habit Tracker</span>
        <RouterLink
          :to="{ name: APPLICATION_ROUTE_NAMES.SETTINGS }"
          class="hover:text-slate-600"
        >
          Settings
        </RouterLink>
      </div>
    </footer>
  </div>
</template>
