<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import {
  DEFAULT_TIME_ZONE,
  updateProfileRequestSchema,
  type UpdateProfileRequest,
} from '@habit-tracker/contracts';

import BaseButton from '../components/BaseButton.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import NotificationSettingsCard from '../components/NotificationSettingsCard.vue';
import PageHeader from '../components/PageHeader.vue';
import { useAuthenticationStore } from '../stores/authentication.store';
import { useToastStore } from '../stores/toast.store';
import { toUserMessage } from '../utilities/error.utility';
import { getTimeZoneOptions } from '../utilities/time-zone.utility';

const authenticationStore = useAuthenticationStore();
const toastStore = useToastStore();

const profileValues = reactive<Required<UpdateProfileRequest>>({
  displayName: '',
  timeZone: DEFAULT_TIME_ZONE,
});
const fieldErrors = ref<Partial<Record<keyof UpdateProfileRequest, string>>>({});
const isSaving = ref(false);

const timeZoneOptions = getTimeZoneOptions().map((timeZone) => ({
  value: timeZone,
  label: timeZone,
}));

const emailAddress = computed(() => authenticationStore.user?.email ?? '');

watch(
  () => authenticationStore.user,
  (user) => {
    if (user !== null) {
      profileValues.displayName = user.displayName;
      profileValues.timeZone = user.timeZone;
    }
  },
  { immediate: true },
);

async function saveProfile(): Promise<void> {
  const validationResult = updateProfileRequestSchema.safeParse(profileValues);

  if (!validationResult.success) {
    const nextFieldErrors: Partial<Record<keyof UpdateProfileRequest, string>> = {};
    for (const issue of validationResult.error.issues) {
      const fieldName = issue.path[0];
      if (typeof fieldName === 'string' && !(fieldName in nextFieldErrors)) {
        nextFieldErrors[fieldName as keyof UpdateProfileRequest] = issue.message;
      }
    }
    fieldErrors.value = nextFieldErrors;
    return;
  }

  fieldErrors.value = {};
  isSaving.value = true;
  try {
    await authenticationStore.updateProfile(validationResult.data);
    toastStore.pushToast('success', 'Profile updated.');
  } catch (error) {
    toastStore.pushToast('error', toUserMessage(error));
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Settings"
      description="Keep your profile and reminder preferences up to date."
    />

    <BaseCard>
      <template #title>Profile</template>
      <template #description>
        Your time zone controls which calendar day a check-in belongs to.
      </template>

      <div class="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
        Signed in as <span class="font-medium text-slate-800">{{ emailAddress }}</span>
      </div>

      <form class="space-y-5" novalidate @submit.prevent="saveProfile">
        <BaseInput
          v-model="profileValues.displayName"
          label="Display name"
          autocomplete="name"
          :is-required="true"
          :error-message="fieldErrors.displayName ?? ''"
        />
        <BaseSelect
          v-model="profileValues.timeZone"
          label="Time zone"
          :options="timeZoneOptions"
          :is-required="true"
          :error-message="fieldErrors.timeZone ?? ''"
        />

        <div class="flex justify-end">
          <BaseButton type="submit" :is-loading="isSaving">Save profile</BaseButton>
        </div>
      </form>
    </BaseCard>

    <NotificationSettingsCard />
  </div>
</template>
