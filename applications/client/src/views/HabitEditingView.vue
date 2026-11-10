<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

import {
  APPLICATION_ROUTE_NAMES,
  HABIT_ROUTE_PARAMETER_NAME,
  buildHabitDetailRoutePath,
  type CreateHabitRequest,
} from '@habit-tracker/contracts';

import BaseButton from '../components/BaseButton.vue';
import BaseCard from '../components/BaseCard.vue';
import EmptyState from '../components/EmptyState.vue';
import HabitForm from '../components/HabitForm.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import PageHeader from '../components/PageHeader.vue';
import { useHabitStore } from '../stores/habit.store';
import { useToastStore } from '../stores/toast.store';
import { toUserMessage } from '../utilities/error.utility';

const route = useRoute();
const router = useRouter();
const habitStore = useHabitStore();
const toastStore = useToastStore();
const { selectedHabit, isLoading, isSaving } = storeToRefs(habitStore);

const habitIdentifier = computed(() => String(route.params[HABIT_ROUTE_PARAMETER_NAME] ?? ''));

async function loadHabit(): Promise<void> {
  try {
    await habitStore.loadHabit(habitIdentifier.value);
  } catch (error) {
    toastStore.pushToast('error', toUserMessage(error));
  }
}

async function updateHabit(request: CreateHabitRequest): Promise<void> {
  try {
    await habitStore.updateHabit(habitIdentifier.value, request);
    toastStore.pushToast('success', 'Habit updated.');
    await router.push(buildHabitDetailRoutePath(habitIdentifier.value));
  } catch (error) {
    toastStore.pushToast('error', toUserMessage(error));
  }
}

function cancelEditing(): void {
  void router.push(buildHabitDetailRoutePath(habitIdentifier.value));
}

onMounted(loadHabit);
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Edit habit"
      description="Adjust the schedule, target, or reminder for this habit."
    />

    <div v-if="isLoading && selectedHabit === null" class="flex justify-center py-16">
      <LoadingSpinner />
    </div>

    <EmptyState
      v-else-if="selectedHabit === null"
      title="Habit not available"
      description="This habit may have been archived or removed."
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

    <BaseCard v-else>
      <HabitForm
        :initial-habit="selectedHabit"
        submit-label="Save changes"
        :is-submitting="isSaving"
        @submit="updateHabit"
      >
        <template #actions>
          <BaseButton variant="secondary" @click="cancelEditing">Cancel</BaseButton>
          <BaseButton type="submit" :is-loading="isSaving">Save changes</BaseButton>
        </template>
      </HabitForm>
    </BaseCard>
  </div>
</template>
