<script setup lang="ts">
withDefaults(defineProps<{ size?: 'small' | 'medium' }>(), { size: 'medium' });
</script>

<template>
  <span
    role="status"
    aria-label="Loading"
    class="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
    :class="size === 'small' ? 'size-4' : 'size-6'"
  />
</template>
