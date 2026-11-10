<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { TOAST_TYPES } from '../constants/presentation.constants';
import { useToastStore } from '../stores/toast.store';

const toastStore = useToastStore();
const { toasts } = storeToRefs(toastStore);

const toastClasses: Record<string, string> = {
  [TOAST_TYPES.SUCCESS]: 'border-brand-200 bg-brand-50 text-brand-900',
  [TOAST_TYPES.ERROR]: 'border-red-200 bg-red-50 text-red-900',
  [TOAST_TYPES.INFORMATION]: 'border-slate-200 bg-white text-slate-900',
};
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
    aria-live="polite"
  >
    <div
      v-for="toast in toasts"
      :key="toast.identifier"
      class="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-lg"
      :class="toastClasses[toast.type]"
    >
      <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
      <button
        type="button"
        class="rounded p-1 text-sm font-bold opacity-60 hover:opacity-100"
        aria-label="Dismiss notification"
        @click="toastStore.dismissToast(toast.identifier)"
      >
        ×
      </button>
    </div>
  </div>
</template>
