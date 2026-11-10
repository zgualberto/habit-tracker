import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { NotificationConfiguration, PushSubscription } from '@habit-tracker/contracts';

import { NOTIFICATION_PERMISSION_VALUES } from '../constants/presentation.constants';
import { notificationService } from '../services/notification.service';
import {
  convertVapidPublicKey,
  toCreatePushSubscriptionRequest,
} from '../utilities/push-subscription.utility';

export const useNotificationStore = defineStore('notification', () => {
  const configuration = ref<NotificationConfiguration | null>(null);
  const subscriptions = ref<PushSubscription[]>([]);
  const permissionState = ref<string>(NOTIFICATION_PERMISSION_VALUES.DEFAULT);
  const isLoading = ref(false);
  const isSaving = ref(false);

  const isSupported = computed(() => 'serviceWorker' in navigator && 'PushManager' in window);

  const isConfigured = computed(() => configuration.value?.isEnabled === true);

  const isSubscribed = computed(() => subscriptions.value.length > 0);

  async function initialise(): Promise<void> {
    if (!isSupported.value) {
      return;
    }

    permissionState.value = Notification.permission;
    isLoading.value = true;
    try {
      const [notificationConfiguration, subscriptionListing] = await Promise.all([
        notificationService.getConfiguration(),
        notificationService.listSubscriptions(),
      ]);
      configuration.value = notificationConfiguration;
      subscriptions.value = subscriptionListing.subscriptions;
    } finally {
      isLoading.value = false;
    }
  }

  async function subscribe(): Promise<void> {
    if (!isSupported.value || !isConfigured.value) {
      return;
    }

    const publicKey = configuration.value?.publicKey;
    if (publicKey === null || publicKey === undefined) {
      return;
    }

    isSaving.value = true;
    try {
      permissionState.value = await Notification.requestPermission();

      if (permissionState.value !== NOTIFICATION_PERMISSION_VALUES.GRANTED) {
        return;
      }

      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      const browserSubscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertVapidPublicKey(publicKey),
      });

      await notificationService.createSubscription(
        toCreatePushSubscriptionRequest(browserSubscription.toJSON()),
      );

      const subscriptionListing = await notificationService.listSubscriptions();
      subscriptions.value = subscriptionListing.subscriptions;
    } finally {
      isSaving.value = false;
    }
  }

  async function unsubscribe(subscription: PushSubscription): Promise<void> {
    isSaving.value = true;
    try {
      await notificationService.deleteSubscription(subscription.identifier);

      if ('serviceWorker' in navigator) {
        const serviceWorkerRegistration = await navigator.serviceWorker.ready;
        const browserSubscription = await serviceWorkerRegistration.pushManager.getSubscription();

        if (browserSubscription?.endpoint === subscription.endpoint) {
          await browserSubscription.unsubscribe();
        }
      }

      subscriptions.value = subscriptions.value.filter(
        (existingSubscription) => existingSubscription.identifier !== subscription.identifier,
      );
    } finally {
      isSaving.value = false;
    }
  }

  async function sendTestNotification(): Promise<number> {
    const testNotificationResponse = await notificationService.sendTestNotification();
    return testNotificationResponse.deliveredCount;
  }

  return {
    configuration,
    subscriptions,
    permissionState,
    isLoading,
    isSaving,
    isSupported,
    isConfigured,
    isSubscribed,
    initialise,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
});
