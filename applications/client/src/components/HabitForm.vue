<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import {
  HABIT_CADENCE_VALUES,
  HABIT_TARGET_TYPE_VALUES,
  REMINDER_TIME_LENGTH,
  createHabitRequestSchema,
  type CreateHabitRequest,
  type Habit,
  type HabitCadence,
  type HabitTargetType,
} from '@habit-tracker/contracts';

import {
  HABIT_CADENCE_LABELS,
  HABIT_TARGET_TYPE_LABELS,
} from '../constants/presentation.constants';
import BaseButton from './BaseButton.vue';
import BaseInput from './BaseInput.vue';
import BaseSelect from './BaseSelect.vue';
import BaseTextarea from './BaseTextarea.vue';
import WeekdaySelector from './WeekdaySelector.vue';

const properties = withDefaults(
  defineProps<{
    initialHabit?: Habit | null;
    isSubmitting?: boolean;
    submitLabel?: string;
  }>(),
  { initialHabit: null, isSubmitting: false, submitLabel: 'Save habit' },
);

const emit = defineEmits<{ submit: [request: CreateHabitRequest] }>();

type HabitFormValues = {
  name: string;
  description: string;
  cadence: HabitCadence;
  weekdays: number[];
  weeklyTarget: string;
  targetType: HabitTargetType;
  targetValue: string;
  reminderTime: string;
};

type HabitFormField = keyof HabitFormValues;

const formValues = reactive<HabitFormValues>({
  name: '',
  description: '',
  cadence: HABIT_CADENCE_VALUES[0],
  weekdays: [],
  weeklyTarget: '',
  targetType: HABIT_TARGET_TYPE_VALUES[0],
  targetValue: '',
  reminderTime: '',
});

const fieldErrors = ref<Partial<Record<HabitFormField, string>>>({});

const cadenceOptions = HABIT_CADENCE_VALUES.map((cadence) => ({
  value: cadence,
  label: HABIT_CADENCE_LABELS[cadence],
}));

const targetTypeOptions = HABIT_TARGET_TYPE_VALUES.map((targetType) => ({
  value: targetType,
  label: HABIT_TARGET_TYPE_LABELS[targetType],
}));

const isWeekdayCadence = computed(() => formValues.cadence === 'WEEKDAYS');
const isWeeklyTargetCadence = computed(() => formValues.cadence === 'WEEKLY_TARGET');
const isCountTarget = computed(() => formValues.targetType === 'COUNT');

function resetForm(habit: Habit | null): void {
  formValues.name = habit?.name ?? '';
  formValues.description = habit?.description ?? '';
  formValues.cadence = habit?.cadence ?? HABIT_CADENCE_VALUES[0];
  formValues.weekdays = habit === null ? [] : [...habit.weekdays];
  formValues.weeklyTarget = habit?.weeklyTarget === null || habit?.weeklyTarget === undefined
    ? ''
    : String(habit.weeklyTarget);
  formValues.targetType = habit?.targetType ?? HABIT_TARGET_TYPE_VALUES[0];
  formValues.targetValue = habit?.targetValue === null || habit?.targetValue === undefined
    ? ''
    : String(habit.targetValue);
  formValues.reminderTime = habit?.reminderTime ?? '';
  fieldErrors.value = {};
}

watch(
  () => properties.initialHabit,
  (habit) => resetForm(habit),
  { immediate: true },
);

function toNullableNumber(inputValue: string): number | null {
  return inputValue.trim().length === 0 ? null : Number(inputValue);
}

function buildRequest(): CreateHabitRequest {
  return {
    name: formValues.name,
    description: formValues.description.trim().length === 0 ? null : formValues.description,
    cadence: formValues.cadence,
    weekdays: isWeekdayCadence.value ? formValues.weekdays : [],
    weeklyTarget: isWeeklyTargetCadence.value ? toNullableNumber(formValues.weeklyTarget) : null,
    targetType: formValues.targetType,
    targetValue: isCountTarget.value ? toNullableNumber(formValues.targetValue) : null,
    reminderTime:
      formValues.reminderTime.length < REMINDER_TIME_LENGTH ? null : formValues.reminderTime,
  };
}

function handleSubmit(): void {
  const validationResult = createHabitRequestSchema.safeParse(buildRequest());

  if (!validationResult.success) {
    const nextFieldErrors: Partial<Record<HabitFormField, string>> = {};

    for (const issue of validationResult.error.issues) {
      const fieldName = issue.path[0];
      if (typeof fieldName === 'string' && !(fieldName in nextFieldErrors)) {
        nextFieldErrors[fieldName as HabitFormField] = issue.message;
      }
    }

    fieldErrors.value = nextFieldErrors;
    return;
  }

  fieldErrors.value = {};
  emit('submit', validationResult.data);
}
</script>

<template>
  <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
    <BaseInput
      v-model="formValues.name"
      label="Habit name"
      placeholder="Morning run"
      :is-required="true"
      :error-message="fieldErrors.name ?? ''"
    />

    <BaseTextarea
      v-model="formValues.description"
      label="Description"
      placeholder="Why does this habit matter to you?"
      :error-message="fieldErrors.description ?? ''"
    />

    <BaseSelect
      v-model="formValues.cadence"
      label="How often?"
      :options="cadenceOptions"
      :is-required="true"
      :error-message="fieldErrors.cadence ?? ''"
    />

    <WeekdaySelector
      v-if="isWeekdayCadence"
      v-model="formValues.weekdays"
      :error-message="fieldErrors.weekdays ?? ''"
    />

    <BaseInput
      v-if="isWeeklyTargetCadence"
      v-model="formValues.weeklyTarget"
      label="Times per week"
      type="number"
      input-mode="numeric"
      :minimum="1"
      :maximum="7"
      :is-required="true"
      :error-message="fieldErrors.weeklyTarget ?? ''"
    />

    <BaseSelect
      v-model="formValues.targetType"
      label="How is it measured?"
      :options="targetTypeOptions"
      :is-required="true"
      :error-message="fieldErrors.targetType ?? ''"
    />

    <BaseInput
      v-if="isCountTarget"
      v-model="formValues.targetValue"
      label="Daily target"
      type="number"
      input-mode="numeric"
      :minimum="1"
      :maximum="1000"
      :is-required="true"
      :error-message="fieldErrors.targetValue ?? ''"
    />

    <BaseInput
      v-model="formValues.reminderTime"
      label="Reminder time"
      type="time"
      :error-message="fieldErrors.reminderTime ?? ''"
    />

    <div class="flex flex-wrap justify-end gap-2 pt-2">
      <slot name="actions">
        <BaseButton type="submit" :is-loading="isSubmitting">{{ submitLabel }}</BaseButton>
      </slot>
    </div>
  </form>
</template>
