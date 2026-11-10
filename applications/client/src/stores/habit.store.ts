import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type {
  CreateHabitRequest,
  Habit,
  HabitLog,
  HabitStatus,
  UpdateHabitRequest,
} from '@habit-tracker/contracts';

import { habitService } from '../services/habit.service';

export const useHabitStore = defineStore('habit', () => {
  const habits = ref<Habit[]>([]);
  const selectedHabit = ref<Habit | null>(null);
  const selectedHabitLogs = ref<HabitLog[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);

  const activeHabitCount = computed(() => habits.value.length);

  async function loadHabits(status: HabitStatus = 'active'): Promise<void> {
    isLoading.value = true;
    try {
      const habitListingResponse = await habitService.listHabits(status);
      habits.value = habitListingResponse.habits;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadHabit(habitIdentifier: string): Promise<Habit> {
    isLoading.value = true;
    try {
      const [habitResponse, logListingResponse] = await Promise.all([
        habitService.getHabit(habitIdentifier),
        habitService.listLogs(habitIdentifier),
      ]);
      selectedHabit.value = habitResponse.habit;
      selectedHabitLogs.value = logListingResponse.logs;
      return habitResponse.habit;
    } finally {
      isLoading.value = false;
    }
  }

  async function createHabit(request: CreateHabitRequest): Promise<Habit> {
    isSaving.value = true;
    try {
      const habitResponse = await habitService.createHabit(request);
      habits.value = [habitResponse.habit, ...habits.value];
      return habitResponse.habit;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateHabit(habitIdentifier: string, request: UpdateHabitRequest): Promise<Habit> {
    isSaving.value = true;
    try {
      const habitResponse = await habitService.updateHabit(habitIdentifier, request);
      selectedHabit.value = habitResponse.habit;
      habits.value = habits.value.map((habit) =>
        habit.identifier === habitIdentifier ? habitResponse.habit : habit,
      );
      return habitResponse.habit;
    } finally {
      isSaving.value = false;
    }
  }

  async function archiveHabit(habitIdentifier: string): Promise<void> {
    isSaving.value = true;
    try {
      await habitService.archiveHabit(habitIdentifier);
      habits.value = habits.value.filter((habit) => habit.identifier !== habitIdentifier);
      if (selectedHabit.value?.identifier === habitIdentifier) {
        selectedHabit.value = null;
      }
    } finally {
      isSaving.value = false;
    }
  }

  function clearSelection(): void {
    selectedHabit.value = null;
    selectedHabitLogs.value = [];
  }

  return {
    habits,
    selectedHabit,
    selectedHabitLogs,
    isLoading,
    isSaving,
    activeHabitCount,
    loadHabits,
    loadHabit,
    createHabit,
    updateHabit,
    archiveHabit,
    clearSelection,
  };
});
