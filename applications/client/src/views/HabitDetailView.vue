<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import {
  APPLICATION_ROUTE_NAMES,
  HABIT_ROUTE_PARAMETER_NAME,
  buildHabitEditingRoutePath,
  buildHabitDetailRoutePath,
} from '@habit-tracker/contracts';

import BaseButton from '../components/BaseButton.vue';
import BaseCard from '../components/BaseCard.vue';
import EmptyState from '../components/EmptyState.vue';
import HabitHistoryList from '../components/HabitHistoryList.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import MetricCard from '../components/MetricCard.vue';
import PageHeader from '../components/PageHeader.vue';
import StreakBadge from '../components/StreakBadge.vue';
import {
  ARCHIVE_CONFIRMATION_MESSAGE,
  HABIT_LOG_COMPLETION_INCREMENT,
  HABIT_CADENCE_LABELS,
  WEEKDAY_SHORT_LABELS,
} from '../constants/presentation.constants';
import { habitService } from '../services/habit.service';
import { useAuthenticationStore } from '../stores/authentication.store';
import { useHabitStore } from '../stores/habit.store';
import { useToastStore } from '../stores/toast.store';
import { toUserMessage } from '../utilities/error.utility';
import { getClientLocalDate } from '../utilities/local-date.utility';

const route = useRoute();
const router = useRouter();
const habitStore = useHabitStore();
const authenticationStore = useAuthenticationStore();
const toastStore = useToastStore();
const { selectedHabit, selectedHabitLogs, isLoading, isSaving } = storeToRefs(habitStore);

const isUpdatingCompletion = ref(false);
const loadErrorMessage = ref('');

const habitIdentifier = computed(() => String(route.params[HABIT_ROUTE_PARAMETER_NAME] ?? ''));
const timeZone = computed(() => authenticationStore.user?.timeZone ?? 'UTC');
const currentLocalDate = computed(() => getClientLocalDate(timeZone.value));

const todayLog = computed(() =>
  selectedHabitLogs.value.find((log) => log.localDate === currentLocalDate.value),
);

const scheduleDescription = computed(() => {
  if (selectedHabit.value === null) {
    return '';
  }

  if (selectedHabit.value.cadence === 'WEEKDAYS') {
    const selectedWeekdayLabels = selectedHabit.value.weekdays.map(
      (weekday) => WEEKDAY_SHORT_LABELS[weekday],
    );
    return selectedWeekdayLabels.length === 0
      ? HABIT_CADENCE_LABELS.WEEKDAYS
      : selectedWeekdayLabels.join(', ');
  }

  if (selectedHabit.value.cadence === 'WEEKLY_TARGET') {
    return `${selectedHabit.value.weeklyTarget ?? 0} times per week`;
  }

  return HABIT_CADENCE_LABELS.DAILY;
});

const targetDescription = computed(() => {
  if (selectedHabit.value === null) {
    return '';
  }
  if (selectedHabit.value.targetType === 'COUNT') {
    return `${selectedHabit.value.targetValue ?? 0} per day`;
  }
  return 'Done or not done';
});

async function loadHabit(): Promise<void> {
  loadErrorMessage.value = '';
  try {
    await habitStore.loadHabit(habitIdentifier.value);
  } catch (error) {
    loadErrorMessage.value = toUserMessage(error);
  }
}

async function toggleTodayCompletion(): Promise<void> {
  if (selectedHabit.value === null) {
    return;
  }

  isUpdatingCompletion.value = true;
  try {
    if (todayLog.value === undefined) {
      await habitService.upsertLog(selectedHabit.value.identifier, currentLocalDate.value, {
        completionValue: selectedHabit.value.targetValue ?? HABIT_LOG_COMPLETION_INCREMENT,
        note: null,
      });
      toastStore.pushToast('success', 'Checked in for today.');
    } else {
      await habitService.deleteLog(selectedHabit.value.identifier, currentLocalDate.value);
      toastStore.pushToast('information', 'Today check-in was removed.');
    }

    await loadHabit();
  } catch (error) {
    toastStore.pushToast('error', toUserMessage(error));
  } finally {
    isUpdatingCompletion.value = false;
  }
}

async function archiveHabit(): Promise<void> {
  if (selectedHabit.value === null) {
    return;
  }

  if (!window.confirm(ARCHIVE_CONFIRMATION_MESSAGE)) {
    return;
  }

  try {
    await habitStore.archiveHabit(selectedHabit.value.identifier);
    toastStore.pushToast('success', 'Habit archived. Its history is still available.');
    await router.push({ name: APPLICATION_ROUTE_NAMES.TODAY });
  } catch (error) {
    toastStore.pushToast('error', toUserMessage(error));
  }
}

onMounted(loadHabit);
</script>

<template>
  <div class="space-y-6">
    <div v-if="isLoading && selectedHabit === null" class="flex justify-center py-16">
      <LoadingSpinner />
    </div>

    <EmptyState
      v-else-if="loadErrorMessage.length > 0 || selectedHabit === null"
      title="Habit not available"
      :description="
        loadErrorMessage.length > 0
          ? loadErrorMessage
          : 'This habit may have been archived or removed.'
      "
    >
      <template #action>
        <RouterLink
          :to="{ name: APPLICATION_ROUTE_NAMES.TODAY }"
          class="inline-flex items-center rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Back to today
        </RouterLink>
      </template>
    </EmptyState>

    <template v-else>
      <PageHeader :title="selectedHabit.name" :description="selectedHabit.description ?? ''">
        <template #actions>
          <RouterLink
            :to="buildHabitEditingRoutePath(selectedHabit.identifier)"
            class="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Edit
          </RouterLink>
          <BaseButton
            variant="danger"
            :is-disabled="isSaving"
            :is-loading="isSaving"
            @click="archiveHabit"
          >
            Archive
          </BaseButton>
        </template>
      </PageHeader>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Current streak" :value="`${selectedHabit.currentStreak} days`" />
        <MetricCard label="Longest streak" :value="`${selectedHabit.longestStreak} days`" />
        <MetricCard label="Schedule" :value="scheduleDescription" />
        <MetricCard label="Target" :value="targetDescription" />
      </div>

      <BaseCard>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h2 class="text-base font-semibold text-slate-900">Today</h2>
              <StreakBadge :streak-in-days="selectedHabit.currentStreak" is-compact />
            </div>
            <p class="text-sm text-slate-500">
              {{
                todayLog === undefined
                  ? 'You have not checked in yet today.'
                  : 'Today is already checked in.'
              }}
            </p>
          </div>
          <BaseButton
            :variant="todayLog === undefined ? 'primary' : 'secondary'"
            :is-disabled="isUpdatingCompletion"
            :is-loading="isUpdatingCompletion"
            @click="toggleTodayCompletion"
          >
            {{ todayLog === undefined ? 'Check in' : 'Undo check-in' }}
          </BaseButton>
        </div>
      </BaseCard>

      <BaseCard>
        <template #title>Check-in history</template>
        <template #description>The most recent check-ins for this habit.</template>
        <HabitHistoryList :logs="selectedHabitLogs" :time-zone="timeZone" :maximum-row-count="30" />
      </BaseCard>

      <p class="text-xs text-slate-400">
        Created {{ new Date(selectedHabit.createdAt).toLocaleDateString() }} ·
        <RouterLink
          :to="buildHabitDetailRoutePath(selectedHabit.identifier)"
          class="hover:text-slate-600"
        >
          Permalink
        </RouterLink>
      </p>
    </template>
  </div>
</template>
