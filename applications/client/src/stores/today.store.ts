import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { TodayResponse } from '@habit-tracker/contracts';

import {
  HABIT_LOG_COMPLETION_INCREMENT,
  PERCENTAGE_MAXIMUM,
} from '../constants/presentation.constants';
import { habitService } from '../services/habit.service';
import { todayService } from '../services/today.service';

type TodayEntry = TodayResponse['habits'][number];

export const useTodayStore = defineStore('today', () => {
  const localDate = ref('');
  const entries = ref<TodayEntry[]>([]);
  const dueCount = ref(0);
  const completedCount = ref(0);
  const isLoading = ref(false);
  const updatingHabitIdentifiers = ref<string[]>([]);

  const completionPercentage = computed(() => {
    if (dueCount.value === 0) {
      return PERCENTAGE_MAXIMUM;
    }
    return Math.round((completedCount.value / dueCount.value) * PERCENTAGE_MAXIMUM);
  });

  async function loadToday(nextLocalDate: string): Promise<void> {
    localDate.value = nextLocalDate;
    isLoading.value = true;
    try {
      const todayResponse = await todayService.getToday(nextLocalDate);
      entries.value = todayResponse.habits;
      dueCount.value = todayResponse.dueCount;
      completedCount.value = todayResponse.completedCount;
    } finally {
      isLoading.value = false;
    }
  }

  async function toggleCompletion(entry: TodayEntry): Promise<void> {
    if (updatingHabitIdentifiers.value.includes(entry.habit.identifier)) {
      return;
    }

    updatingHabitIdentifiers.value = [...updatingHabitIdentifiers.value, entry.habit.identifier];
    try {
      if (entry.log === null) {
        await habitService.upsertLog(entry.habit.identifier, localDate.value, {
          completionValue: entry.habit.targetValue ?? HABIT_LOG_COMPLETION_INCREMENT,
          note: null,
        });
      } else {
        await habitService.deleteLog(entry.habit.identifier, localDate.value);
      }

      await loadToday(localDate.value);
    } finally {
      updatingHabitIdentifiers.value = updatingHabitIdentifiers.value.filter(
        (habitIdentifier) => habitIdentifier !== entry.habit.identifier,
      );
    }
  }

  function isEntryUpdating(habitIdentifier: string): boolean {
    return updatingHabitIdentifiers.value.includes(habitIdentifier);
  }

  return {
    localDate,
    entries,
    dueCount,
    completedCount,
    isLoading,
    completionPercentage,
    loadToday,
    toggleCompletion,
    isEntryUpdating,
  };
});
