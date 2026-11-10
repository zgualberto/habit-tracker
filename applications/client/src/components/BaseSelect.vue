<script setup lang="ts">
import { useId } from 'vue';

type SelectOption = { value: string; label: string };

withDefaults(
  defineProps<{
    label: string;
    options: readonly SelectOption[];
    errorMessage?: string;
    isRequired?: boolean;
  }>(),
  { errorMessage: '', isRequired: false },
);

const modelValue = defineModel<string>({ required: true });

const selectIdentifier = useId();
const errorIdentifier = useId();
</script>

<template>
  <div class="space-y-1.5">
    <label :for="selectIdentifier" class="block text-sm font-medium text-slate-700">
      {{ label }}
      <span v-if="isRequired" class="text-red-600" aria-hidden="true">*</span>
    </label>
    <select
      :id="selectIdentifier"
      v-model="modelValue"
      :required="isRequired"
      :aria-invalid="errorMessage.length > 0"
      :aria-describedby="errorMessage.length > 0 ? errorIdentifier : undefined"
      class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <p v-if="errorMessage.length > 0" :id="errorIdentifier" class="text-sm text-red-600">
      {{ errorMessage }}
    </p>
  </div>
</template>
