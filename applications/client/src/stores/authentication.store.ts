import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type {
  LoginRequest,
  RegistrationRequest,
  UpdateProfileRequest,
  UserProfile,
} from '@habit-tracker/contracts';

import { authenticationService } from '../services/authentication.service';

export const useAuthenticationStore = defineStore('authentication', () => {
  const user = ref<UserProfile | null>(null);
  const isInitialised = ref(false);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => user.value !== null);

  async function loadCurrentUser(): Promise<void> {
    if (isInitialised.value) {
      return;
    }

    try {
      const authenticationResponse = await authenticationService.getProfile();
      user.value = authenticationResponse.user;
    } catch {
      user.value = null;
    } finally {
      isInitialised.value = true;
    }
  }

  async function register(request: RegistrationRequest): Promise<void> {
    isLoading.value = true;
    try {
      const authenticationResponse = await authenticationService.register(request);
      user.value = authenticationResponse.user;
      isInitialised.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  async function login(request: LoginRequest): Promise<void> {
    isLoading.value = true;
    try {
      const authenticationResponse = await authenticationService.login(request);
      user.value = authenticationResponse.user;
      isInitialised.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await authenticationService.logout();
    } finally {
      clearAuthentication();
    }
  }

  async function updateProfile(request: UpdateProfileRequest): Promise<void> {
    isLoading.value = true;
    try {
      const authenticationResponse = await authenticationService.updateProfile(request);
      user.value = authenticationResponse.user;
    } finally {
      isLoading.value = false;
    }
  }

  function clearAuthentication(): void {
    user.value = null;
    isInitialised.value = true;
  }

  return {
    user,
    isInitialised,
    isLoading,
    isAuthenticated,
    loadCurrentUser,
    register,
    login,
    logout,
    updateProfile,
    clearAuthentication,
  };
});
