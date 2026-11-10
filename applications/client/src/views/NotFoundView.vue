<script setup lang="ts">
import { RouterLink } from 'vue-router';

import { APPLICATION_ROUTE_NAMES } from '@habit-tracker/contracts';

import { PAGE_TITLES } from '../constants/page-titles.constants';
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-slate-100 px-4">
    <div class="max-w-md space-y-4 text-center">
      <p class="text-sm font-semibold uppercase tracking-wide text-brand-700">404</p>
      <h1 class="text-3xl font-bold text-slate-900">{{ PAGE_TITLES.NOT_FOUND }}</h1>
      <p class="text-sm text-slate-500">
        The page you were looking for has moved or never existed.
      </p>
      <RouterLink
        :to="{ name: APPLICATION_ROUTE_NAMES.TODAY }"
        class="inline-flex rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
      >
        Back to today
      </RouterLink>
    </div>
  </div>
</template>
