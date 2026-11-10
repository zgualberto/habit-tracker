<script setup lang="ts">
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import {
  APPLICATION_ROUTE_NAMES,
  DEFAULT_TIME_ZONE,
  registrationRequestSchema,
  type RegistrationRequest,
} from '@habit-tracker/contracts';

import AuthenticationShell from '../components/AuthenticationShell.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import { useAuthenticationStore } from '../stores/authentication.store';
import { toUserMessage } from '../utilities/error.utility';
import { resolveBrowserTimeZone } from '../utilities/local-date.utility';
import { getTimeZoneOptions } from '../utilities/time-zone.utility';

const router = useRouter();
const authenticationStore = useAuthenticationStore();

const registrationValues = reactive<RegistrationRequest>({
  email: '',
  password: '',
  displayName: '',
  timeZone: resolveBrowserTimeZone() || DEFAULT_TIME_ZONE,
});
const fieldErrors = ref<Partial<Record<keyof RegistrationRequest, string>>>({});
const formErrorMessage = ref('');

const timeZoneOptions = getTimeZoneOptions().map((timeZone) => ({
  value: timeZone,
  label: timeZone,
}));

async function submitRegistration(): Promise<void> {
  formErrorMessage.value = '';
  const validationResult = registrationRequestSchema.safeParse(registrationValues);

  if (!validationResult.success) {
    const nextFieldErrors: Partial<Record<keyof RegistrationRequest, string>> = {};
    for (const issue of validationResult.error.issues) {
      const fieldName = issue.path[0];
      if (typeof fieldName === 'string' && !(fieldName in nextFieldErrors)) {
        nextFieldErrors[fieldName as keyof RegistrationRequest] = issue.message;
      }
    }
    fieldErrors.value = nextFieldErrors;
    return;
  }

  fieldErrors.value = {};

  try {
    await authenticationStore.register(validationResult.data);
    await router.push({ name: APPLICATION_ROUTE_NAMES.TODAY });
  } catch (error) {
    formErrorMessage.value = toUserMessage(error);
  }
}
</script>

<template>
  <AuthenticationShell
    title="Create your account"
    description="Track the habits that matter, one check-in at a time."
  >
    <form class="space-y-5" novalidate @submit.prevent="submitRegistration">
      <BaseInput
        v-model="registrationValues.displayName"
        label="Display name"
        autocomplete="name"
        placeholder="Ana Santos"
        :is-required="true"
        :error-message="fieldErrors.displayName ?? ''"
      />
      <BaseInput
        v-model="registrationValues.email"
        label="Email address"
        type="email"
        autocomplete="email"
        placeholder="you@example.com"
        :is-required="true"
        :error-message="fieldErrors.email ?? ''"
      />
      <BaseInput
        v-model="registrationValues.password"
        label="Password"
        type="password"
        autocomplete="new-password"
        placeholder="At least 8 characters"
        :is-required="true"
        :error-message="fieldErrors.password ?? ''"
      />
      <BaseSelect
        v-model="registrationValues.timeZone"
        label="Time zone"
        :options="timeZoneOptions"
        :is-required="true"
        :error-message="fieldErrors.timeZone ?? ''"
      />

      <p v-if="formErrorMessage.length > 0" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ formErrorMessage }}
      </p>

      <BaseButton type="submit" :is-loading="authenticationStore.isLoading" is-full-width>
        Create account
      </BaseButton>
    </form>

    <template #footer>
      Already have an account?
      <RouterLink
        :to="{ name: APPLICATION_ROUTE_NAMES.LOGIN }"
        class="font-semibold text-brand-700 hover:text-brand-800"
      >
        Sign in
      </RouterLink>
    </template>
  </AuthenticationShell>
</template>
