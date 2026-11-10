<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';

import { APPLICATION_ROUTE_NAMES } from '@habit-tracker/contracts';

import BaseButton from '../components/BaseButton.vue';
import BaseCard from '../components/BaseCard.vue';
import EmptyState from '../components/EmptyState.vue';
import HabitCard from '../components/HabitCard.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import PageHeader from '../components/PageHeader.vue';
import ProgressBar from '../components/ProgressBar.vue';
import { useAuthenticationStore } from '../stores/authentication.store';
import { useTodayStore } from '../stores/today.store';
import { useToastStore } from '../stores/toast.store';
import { toUserMessage } from '../utilities/error.utility';
import { formatDisplayLocalDate, getClientLocalDate } from '../utilities/local-date.utility';

const authenticationStore = useAuthenticationStore();
const todayStore = useTodayStore();
const toastStore = useToastStore();
const { entries, dueCount, completedCount, isLoading, completionPercentage } =
  storeToRefs(todayStore);

const timeZone = computed(() => authenticationStore.user?.timeZone ?? 'UTC');
const currentLocalDate = computed(() => getClientLocalDate(timeZone.value));

const summaryMessage = computed(() => {
  if (dueCount.value === 0) {
    return 'Nothing is scheduled for today. Enjoy the rest day.';
  }
  if (completedCount.value === dueCount.value) {
    return 'Every habit is checked in. That is a perfect day.';
  }
  return `${dueCount.value - completedCount.value} of ${dueCount.value} habits still waiting.`;
});

async function loadToday(): Promise<void> {
  try {
    await todayStore.loadToday(currentLocalDate.value);
  } catch (error) {
    toastStore.pushToast('error', toUserMessage(error));
  }
}

async function toggleHabitCompletion(entry: (typeof entries.value)[number]): Promise<void> {
  try {
    await todayStore.toggleCompletion(entry);
  } catch (error) {
    toastStore.pushToast('error', toUserMessage(error));
  }
}

onMounted(loadToday);
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Today" :description="formatDisplayLocalDate(currentLocalDate)">
      <template #actions>
        <RouterLink
          :to="{ name: APPLICATION_ROUTE_NAMES.HABIT_CREATION }"
          class="inline-flex items-center rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          New habit
        </RouterLink>
      </template>
    </PageHeader>

    <BaseCard>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-slate-500">Daily progress</p>
          <p class="mt-1 text-2xl font-bold text-slate-900">
            {{ completedCount }} / {{ dueCount }}
          </p>
        </div>
        <p class="max-w-sm text-right text-sm text-slate-500">{{ summaryMessage }}</p>
      </div>
      <div class="mt-4">
        <ProgressBar :percentage="completionPercentage" label="Habits completed" />
      </div>
    </BaseCard>

    <div v-if="isLoading" class="flex justify-center py-12">
      <LoadingSpinner />
    </div>

    <EmptyState
      v-else-if="entries.length === 0"
      title="No habits yet"
      description="Create your first habit to start building a streak today."
    >
      <template #action>
        <RouterLink
          :to="{ name: APPLICATION_ROUTE_NAMES.HABIT_CREATION }"
          class="inline-flex items-center rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Create a habit
        </RouterLink>
      </template>
    </EmptyState>

    <div v-else class="space-y-3">
      <HabitCard
        v-for="entry in entries"
        :key="entry.habit.identifier"
        :habit="entry.habit"
        :is-due="entry.isDue"
        :is-completed="entry.isCompleted"
        :is-updating="todayStore.isEntryUpdating(entry.habit.identifier)"
        :completion-value="entry.log?.completionValue ?? null"
        @toggle-completion="toggleHabitCompletion(entry)"
      />
    </div>

    <BaseButton v-if="entries.length > 0" variant="ghost" @click="loadToday"> Refresh </BaseButton>
  </div>
</template>
