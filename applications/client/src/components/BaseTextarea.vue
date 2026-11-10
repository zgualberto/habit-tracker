<script setup lang="ts">
import { useId } from 'vue';

withDefaults(
  defineProps<{
    label: string;
    placeholder?: string;
    errorMessage?: string;
    rowCount?: number;
  }>(),
  { placeholder: '', errorMessage: '', rowCount: 3 },
);

const modelValue = defineModel<string>({ required: true });

const textareaIdentifier = useId();
const errorIdentifier = useId();
</script>

<template>
  <div class="space-y-1.5">
    <label :for="textareaIdentifier" class="block text-sm font-medium text-slate-700">
      {{ label }}
    </label>
    <textarea
      :id="textareaIdentifier"
      v-model="modelValue"
      :rows="rowCount"
      :placeholder="placeholder"
      :aria-invalid="errorMessage.length > 0"
      :aria-describedby="errorMessage.length > 0 ? errorIdentifier : undefined"
      class="block w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
    />
    <p v-if="errorMessage.length > 0" :id="errorIdentifier" class="text-sm text-red-600">
      {{ errorMessage }}
    </p>
  </div>
</template>
