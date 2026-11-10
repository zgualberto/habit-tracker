<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import {
  APPLICATION_ROUTE_NAMES,
  loginRequestSchema,
  type LoginRequest,
} from '@habit-tracker/contracts';
import { type ApiError } from '../services/api-client';

import AuthenticationShell from '../components/AuthenticationShell.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import { LOGIN_REDIRECT_QUERY_KEY } from '../constants/presentation.constants';
import { useAuthenticationStore } from '../stores/authentication.store';
import { toUserMessage } from '../utilities/error.utility';

const route = useRoute();
const router = useRouter();
const authenticationStore = useAuthenticationStore();

const credentials = reactive<LoginRequest>({ email: '', password: '' });
const fieldErrors = ref<Partial<Record<keyof LoginRequest, string>>>({});
const formErrorMessage = ref('');

const redirectPath = computed(() => {
  const redirectQuery = route.query[LOGIN_REDIRECT_QUERY_KEY];
  const candidatePath = typeof redirectQuery === 'string' ? redirectQuery : '';
  return candidatePath.startsWith('/') ? candidatePath : null;
});

async function submitCredentials(): Promise<void> {
  formErrorMessage.value = '';
  const validationResult = loginRequestSchema.safeParse(credentials);

  if (!validationResult.success) {
    const nextFieldErrors: Partial<Record<keyof LoginRequest, string>> = {};
    for (const issue of validationResult.error.issues) {
      const fieldName = issue.path[0];
      if (typeof fieldName === 'string' && !(fieldName in nextFieldErrors)) {
        nextFieldErrors[fieldName as keyof LoginRequest] = issue.message;
      }
    }
    fieldErrors.value = nextFieldErrors;
    return;
  }

  fieldErrors.value = {};

  try {
    await authenticationStore.login(validationResult.data);
    await router.push(redirectPath.value ?? { name: APPLICATION_ROUTE_NAMES.TODAY });
  } catch (error) {
    formErrorMessage.value = toUserMessage(error as ApiError | Error);
  }
}
</script>

<template>
  <AuthenticationShell
    title="Welcome back"
    description="Sign in to check in on your habits and keep your streaks alive."
  >
    <form class="space-y-5" novalidate @submit.prevent="submitCredentials">
      <BaseInput
        v-model="credentials.email"
        label="Email address"
        type="email"
        autocomplete="email"
        placeholder="you@example.com"
        :is-required="true"
        :error-message="fieldErrors.email ?? ''"
      />
      <BaseInput
        v-model="credentials.password"
        label="Password"
        type="password"
        autocomplete="current-password"
        placeholder="Your password"
        :is-required="true"
        :error-message="fieldErrors.password ?? ''"
      />

      <p
        v-if="formErrorMessage.length > 0"
        class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ formErrorMessage }}
      </p>

      <BaseButton type="submit" :is-loading="authenticationStore.isLoading" is-full-width>
        Sign in
      </BaseButton>
    </form>

    <template #footer>
      New here?
      <RouterLink
        :to="{ name: APPLICATION_ROUTE_NAMES.REGISTRATION }"
        class="font-semibold text-brand-700 hover:text-brand-800"
      >
        Create an account
      </RouterLink>
    </template>
  </AuthenticationShell>
</template>
