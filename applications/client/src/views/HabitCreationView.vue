<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { buildHabitDetailRoutePath, type CreateHabitRequest } from '@habit-tracker/contracts';

import BaseCard from '../components/BaseCard.vue';
import HabitForm from '../components/HabitForm.vue';
import PageHeader from '../components/PageHeader.vue';
import { useHabitStore } from '../stores/habit.store';
import { useToastStore } from '../stores/toast.store';
import { toUserMessage } from '../utilities/error.utility';

const router = useRouter();
const habitStore = useHabitStore();
const toastStore = useToastStore();
const { isSaving } = storeToRefs(habitStore);

async function createHabit(request: CreateHabitRequest): Promise<void> {
  try {
    const createdHabit = await habitStore.createHabit(request);
    toastStore.pushToast('success', `${createdHabit.name} is ready for its first check-in.`);
    await router.push(buildHabitDetailRoutePath(createdHabit.identifier));
  } catch (error) {
    toastStore.pushToast('error', toUserMessage(error));
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="New habit"
      description="Choose something small enough to repeat and important enough to keep."
    />

    <BaseCard>
      <HabitForm submit-label="Create habit" :is-submitting="isSaving" @submit="createHabit" />
    </BaseCard>
  </div>
</template>
