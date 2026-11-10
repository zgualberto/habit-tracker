<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import { APPLICATION_ROUTE_NAMES, APPLICATION_ROUTE_PATHS } from '@habit-tracker/contracts';

import { APPLICATION_NAME } from '../constants/application.constants';
import { useAuthenticationStore } from '../stores/authentication.store';
import { useToastStore } from '../stores/toast.store';
import { toUserMessage } from '../utilities/error.utility';
import BaseButton from './BaseButton.vue';

const router = useRouter();
const currentRoute = useRoute();
const authenticationStore = useAuthenticationStore();
const toastStore = useToastStore();

const navigationItems = [
  { label: 'Today', routeName: APPLICATION_ROUTE_NAMES.TODAY },
  { label: 'Insights', routeName: APPLICATION_ROUTE_NAMES.INSIGHTS },
  { label: 'Settings', routeName: APPLICATION_ROUTE_NAMES.SETTINGS },
] as const;

const displayName = computed(() => authenticationStore.user?.displayName ?? 'Account');

function isActiveRoute(routeName: string): boolean {
  return currentRoute.name === routeName;
}

async function signOut(): Promise<void> {
  try {
    await authenticationStore.logout();
    await router.push({ name: APPLICATION_ROUTE_NAMES.LOGIN });
  } catch (error) {
    toastStore.pushToast('error', toUserMessage(error));
  }
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
      <RouterLink
        :to="APPLICATION_ROUTE_PATHS.TODAY"
        class="flex items-center gap-2 text-base font-bold text-brand-700"
      >
        <span class="flex size-8 items-center justify-center rounded-lg bg-brand-700 text-white">✓</span>
        <span class="hidden sm:inline">{{ APPLICATION_NAME }}</span>
      </RouterLink>

      <nav class="flex flex-1 items-center gap-1" aria-label="Main navigation">
        <RouterLink
          v-for="navigationItem in navigationItems"
          :key="navigationItem.routeName"
          :to="{ name: navigationItem.routeName }"
          class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="
            isActiveRoute(navigationItem.routeName)
              ? 'bg-brand-50 text-brand-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          "
        >
          {{ navigationItem.label }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-2">
        <RouterLink
          :to="{ name: APPLICATION_ROUTE_NAMES.HABIT_CREATION }"
          class="hidden rounded-lg bg-brand-700 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-800 sm:inline-flex"
        >
          New habit
        </RouterLink>
        <span class="hidden max-w-40 truncate text-sm text-slate-600 md:inline">
          {{ displayName }}
        </span>
        <BaseButton variant="ghost" @click="signOut">Sign out</BaseButton>
      </div>
    </div>
  </header>
</template>
