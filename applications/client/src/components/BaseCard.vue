<script setup lang="ts">
withDefaults(defineProps<{ isPadded?: boolean }>(), { isPadded: true });
</script>

<template>
  <section
    class="rounded-2xl border border-slate-200 bg-white shadow-sm"
    :class="isPadded ? 'p-5 sm:p-6' : ''"
  >
    <header v-if="$slots.title" class="mb-4">
      <h2 class="text-base font-semibold text-slate-900">
        <slot name="title" />
      </h2>
      <p v-if="$slots.description" class="mt-1 text-sm text-slate-500">
        <slot name="description" />
      </p>
    </header>
    <slot />
  </section>
</template>
