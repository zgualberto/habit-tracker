<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import type { PushSubscription } from '@habit-tracker/contracts';

import { NOTIFICATION_PERMISSION_VALUES } from '../constants/presentation.constants';
import { useNotificationStore } from '../stores/notification.store';
import { useToastStore } from '../stores/toast.store';
import { toUserMessage } from '../utilities/error.utility';
import BaseButton from './BaseButton.vue';
import BaseCard from './BaseCard.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const notificationStore = useNotificationStore();
const toastStore = useToastStore();
const {
  configuration,
  subscriptions,
  permissionState,
  isLoading,
  isSaving,
  isSupported,
  isConfigured,
  isSubscribed,
} = storeToRefs(notificationStore);

const permissionDescription = computed(() => {
  if (permissionState.value === NOTIFICATION_PERMISSION_VALUES.GRANTED) {
    return 'Your browser has granted notification permission.';
  }
  if (permissionState.value === NOTIFICATION_PERMISSION_VALUES.DENIED) {
    return 'Notifications are blocked in your browser settings.';
  }
  return 'Your browser has not asked for notification permission yet.';
});

function describeSubscription(subscription: PushSubscription): string {
  try {
    const subscriptionUrl = new URL(subscription.endpoint);
    return subscriptionUrl.host;
  } catch {
    return 'Unknown browser';
  }
}

async function loadNotificationSettings(): Promise<void> {
  try {
    await notificationStore.initialise();
  } catch (error) {
    toastStore.pushToast('error', toUserMessage(error));
  }
}

async function enableNotifications(): Promise<void> {
  try {
    await notificationStore.subscribe();

    if (!isSubscribed.value) {
      toastStore.pushToast(
        'information',
        'Notifications were not enabled. Check your browser permission settings.',
      );
      return;
    }

    toastStore.pushToast('success', 'Push notifications are enabled on this browser.');
  } catch (error) {
    toastStore.pushToast('error', toUserMessage(error));
  }
}

async function removeSubscription(subscription: PushSubscription): Promise<void> {
  try {
    await notificationStore.unsubscribe(subscription);
    toastStore.pushToast('success', 'This browser will no longer receive reminders.');
  } catch (error) {
    toastStore.pushToast('error', toUserMessage(error));
  }
}

async function sendTestNotification(): Promise<void> {
  try {
    const deliveredCount = await notificationStore.sendTestNotification();

    if (deliveredCount === 0) {
      toastStore.pushToast('information', 'No enabled browser received the test notification.');
      return;
    }

    toastStore.pushToast('success', `Test notification sent to ${deliveredCount} browser(s).`);
  } catch (error) {
    toastStore.pushToast('error', toUserMessage(error));
  }
}

onMounted(loadNotificationSettings);
</script>

<template>
  <BaseCard>
    <template #title>Reminders and notifications</template>
    <template #description>
      Get a daily push notification at the reminder time you set on each habit.
    </template>

    <div v-if="!isSupported" class="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
      This browser does not support push notifications.
    </div>

    <div v-else-if="isLoading" class="flex justify-center py-6">
      <LoadingSpinner />
    </div>

    <div v-else class="space-y-5">
      <div class="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <p>{{ permissionDescription }}</p>
        <p v-if="!isConfigured" class="mt-2 text-amber-700">
          Push notifications are not configured on this server.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <BaseButton
          v-if="!isSubscribed"
          :is-disabled="!isConfigured || isSaving"
          :is-loading="isSaving"
          @click="enableNotifications"
        >
          Enable notifications on this browser
        </BaseButton>
        <BaseButton
          v-else
          variant="secondary"
          :is-disabled="isSaving"
          :is-loading="isSaving"
          @click="sendTestNotification"
        >
          Send a test notification
        </BaseButton>
      </div>

      <section v-if="subscriptions.length > 0" aria-labelledby="subscriptions-heading">
        <h3 id="subscriptions-heading" class="mb-2 text-sm font-semibold text-slate-700">
          Enabled browsers
        </h3>
        <ul class="divide-y divide-slate-100">
          <li
            v-for="subscription in subscriptions"
            :key="subscription.identifier"
            class="flex flex-wrap items-center justify-between gap-2 py-3"
          >
            <div>
              <p class="text-sm font-medium text-slate-800">
                {{ describeSubscription(subscription) }}
              </p>
              <p class="text-xs text-slate-400">
                Added {{ new Date(subscription.createdAt).toLocaleDateString() }}
              </p>
            </div>
            <BaseButton
              variant="danger"
              :is-disabled="isSaving"
              @click="removeSubscription(subscription)"
            >
              Remove
            </BaseButton>
          </li>
        </ul>
      </section>

      <p v-if="configuration === null" class="text-xs text-slate-400">
        Notification configuration has not been loaded.
      </p>
    </div>
  </BaseCard>
</template>
