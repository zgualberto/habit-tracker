<script setup lang="ts">
import { useId } from 'vue';

withDefaults(
  defineProps<{
    label: string;
    type?: string;
    placeholder?: string;
    autocomplete?: string;
    errorMessage?: string;
    isRequired?: boolean;
    minimum?: number;
    maximum?: number;
    inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'url' | 'search';
  }>(),
  {
    type: 'text',
    placeholder: '',
    autocomplete: 'off',
    errorMessage: '',
    isRequired: false,
    minimum: undefined,
    maximum: undefined,
    inputMode: 'text',
  },
);

const modelValue = defineModel<string>({ required: true });

const inputIdentifier = useId();
const errorIdentifier = useId();
</script>

<template>
  <div class="space-y-1.5">
    <label :for="inputIdentifier" class="block text-sm font-medium text-slate-700">
      {{ label }}
      <span v-if="isRequired" class="text-red-600" aria-hidden="true">*</span>
    </label>
    <input
      :id="inputIdentifier"
      v-model="modelValue"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="isRequired"
      :min="minimum"
      :max="maximum"
      :inputmode="inputMode"
      :aria-invalid="errorMessage.length > 0"
      :aria-describedby="errorMessage.length > 0 ? errorIdentifier : undefined"
      class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
    />
    <p v-if="errorMessage.length > 0" :id="errorIdentifier" class="text-sm text-red-600">
      {{ errorMessage }}
    </p>
  </div>
</template>
