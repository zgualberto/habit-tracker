import {
  NOTIFICATION_RESOURCE_ACTIONS,
  type CreatePushSubscriptionRequest,
  type NotificationConfiguration,
  type PushSubscription,
  type PushSubscriptionListingResponse,
  type TestNotificationResponse,
} from '@habit-tracker/contracts';

import {
  buildNotificationsApiPath,
  buildPushSubscriptionsApiPath,
} from '../constants/api-paths.utility';
import { HTTP_METHODS } from '../constants/application.constants';
import { apiRequest } from './api-client';

export const notificationService = {
  getConfiguration(): Promise<NotificationConfiguration> {
    return apiRequest<NotificationConfiguration>(
      buildNotificationsApiPath(NOTIFICATION_RESOURCE_ACTIONS.CONFIGURATION),
    );
  },

  listSubscriptions(): Promise<PushSubscriptionListingResponse> {
    return apiRequest<PushSubscriptionListingResponse>(buildPushSubscriptionsApiPath());
  },

  createSubscription(request: CreatePushSubscriptionRequest): Promise<PushSubscription> {
    return apiRequest<PushSubscription>(buildPushSubscriptionsApiPath(), {
      method: HTTP_METHODS.POST,
      body: request,
    });
  },

  deleteSubscription(identifier: string): Promise<void> {
    return apiRequest<void>(
      `${buildPushSubscriptionsApiPath()}/${encodeURIComponent(identifier)}`,
      {
        method: HTTP_METHODS.DELETE,
      },
    );
  },

  sendTestNotification(): Promise<TestNotificationResponse> {
    return apiRequest<TestNotificationResponse>(
      buildNotificationsApiPath(NOTIFICATION_RESOURCE_ACTIONS.TEST),
      { method: HTTP_METHODS.POST },
    );
  },
};
