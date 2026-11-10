import { defineStore } from 'pinia';
import { ref } from 'vue';

import { TOAST_DURATION_IN_MILLISECONDS, TOAST_TYPES } from '../constants/presentation.constants';

export type ToastType = (typeof TOAST_TYPES)[keyof typeof TOAST_TYPES];

export type Toast = {
  identifier: number;
  type: ToastType;
  message: string;
};

let nextToastIdentifier = 1;

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);

  function dismissToast(identifier: number): void {
    toasts.value = toasts.value.filter((toast) => toast.identifier !== identifier);
  }

  function pushToast(type: ToastType, message: string): void {
    const toast: Toast = { identifier: nextToastIdentifier, type, message };
    nextToastIdentifier += 1;
    toasts.value = [...toasts.value, toast];

    window.setTimeout(() => dismissToast(toast.identifier), TOAST_DURATION_IN_MILLISECONDS);
  }

  return {
    toasts,
    pushToast,
    dismissToast,
  };
});
