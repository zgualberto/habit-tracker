<script setup lang="ts">
import { computed } from 'vue';

import LoadingSpinner from './LoadingSpinner.vue';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const properties = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    type?: 'button' | 'submit';
    isLoading?: boolean;
    isDisabled?: boolean;
    isFullWidth?: boolean;
  }>(),
  {
    variant: 'primary',
    type: 'button',
    isLoading: false,
    isDisabled: false,
    isFullWidth: false,
  },
);

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-700 text-white shadow-sm hover:bg-brand-800 disabled:bg-brand-300 disabled:text-brand-50',
  secondary:
    'border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50 disabled:text-slate-400',
  danger:
    'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:text-red-300',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-300',
};

const buttonClasses = computed(() => [
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed',
  variantClasses[properties.variant],
  properties.isFullWidth ? 'w-full' : '',
]);
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled || isLoading"
    :class="buttonClasses"
    @click="emit('click', $event)"
  >
    <LoadingSpinner v-if="isLoading" size="small" />
    <slot />
  </button>
</template>
