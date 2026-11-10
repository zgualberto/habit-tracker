import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PushSubscription } from '@prisma/client';
import webPush from 'web-push';

import {
  ERROR_CODES,
  ERROR_MESSAGES,
  type NotificationConfiguration,
  type TestNotificationResponse,
} from '@habit-tracker/contracts';

import { ENVIRONMENT_VARIABLE_NAMES } from '../common/constants/environment.constants';
import {
  EXPIRED_PUSH_SUBSCRIPTION_STATUS_CODES,
  REMINDER_NOTIFICATION_BODY_PREFIX,
  REMINDER_NOTIFICATION_TAG_PREFIX,
  REMINDER_NOTIFICATION_TITLE,
  REMINDER_NOTIFICATION_URL,
  TEST_NOTIFICATION_BODY,
  TEST_NOTIFICATION_TAG,
  TEST_NOTIFICATION_TITLE,
} from '../common/constants/notification.constants';
import { PushSubscriptionRepository } from './push-subscription.repository';
import type { RemindableHabit } from './reminder.repository';

type PushNotificationPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
};

type WebPushErrorShape = {
  statusCode?: number;
};

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private readonly publicKey: string | null;

  public constructor(
    private readonly pushSubscriptionRepository: PushSubscriptionRepository,
    configurationService: ConfigService,
  ) {
    const configuredPublicKey =
      configurationService.get<string>(ENVIRONMENT_VARIABLE_NAMES.VAPID_PUBLIC_KEY) ?? null;
    const configuredPrivateKey =
      configurationService.get<string>(ENVIRONMENT_VARIABLE_NAMES.VAPID_PRIVATE_KEY) ?? null;
    const subject = configurationService.getOrThrow<string>(
      ENVIRONMENT_VARIABLE_NAMES.VAPID_SUBJECT,
    );

    if (configuredPublicKey !== null && configuredPrivateKey !== null) {
      webPush.setVapidDetails(subject, configuredPublicKey, configuredPrivateKey);
      this.publicKey = configuredPublicKey;
      return;
    }

    this.publicKey = null;
    this.logger.warn('VAPID keys are not set; push notifications are disabled.');
  }

  public getConfiguration(): NotificationConfiguration {
    return {
      isEnabled: this.publicKey !== null,
      publicKey: this.publicKey,
    };
  }

  public async sendTestNotification(userIdentifier: string): Promise<TestNotificationResponse> {
    this.ensureConfigured();

    const subscriptions = await this.pushSubscriptionRepository.findManyByUser(userIdentifier);

    return this.sendToSubscriptions(subscriptions, {
      title: TEST_NOTIFICATION_TITLE,
      body: TEST_NOTIFICATION_BODY,
      url: REMINDER_NOTIFICATION_URL,
      tag: TEST_NOTIFICATION_TAG,
    });
  }

  public async sendReminderNotification(
    habit: RemindableHabit,
    localDate: string,
  ): Promise<TestNotificationResponse> {
    if (this.publicKey === null) {
      return { deliveredCount: 0, expiredCount: 0 };
    }

    const subscriptions = await this.pushSubscriptionRepository.findManyByUser(
      habit.userIdentifier,
    );

    return this.sendToSubscriptions(subscriptions, {
      title: REMINDER_NOTIFICATION_TITLE,
      body: `${REMINDER_NOTIFICATION_BODY_PREFIX} ${habit.name}`,
      url: REMINDER_NOTIFICATION_URL,
      tag: `${REMINDER_NOTIFICATION_TAG_PREFIX}${habit.identifier}-${localDate}`,
    });
  }

  private async sendToSubscriptions(
    subscriptions: readonly PushSubscription[],
    payload: PushNotificationPayload,
  ): Promise<TestNotificationResponse> {
    let deliveredCount = 0;
    let expiredCount = 0;

    const deliveryResults = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.authentication,
            },
          },
          JSON.stringify(payload),
        ),
      ),
    );

    for (const [subscriptionIndex, deliveryResult] of deliveryResults.entries()) {
      if (deliveryResult.status === 'fulfilled') {
        deliveredCount += 1;
        continue;
      }

      const subscription = subscriptions[subscriptionIndex];
      const statusCode = (deliveryResult.reason as WebPushErrorShape | undefined)?.statusCode;

      if (
        subscription !== undefined &&
        statusCode !== undefined &&
        EXPIRED_PUSH_SUBSCRIPTION_STATUS_CODES.includes(statusCode)
      ) {
        // The browser revoked the subscription; keeping the row would make every
        // future send fail again.
        await this.pushSubscriptionRepository.deleteByEndpoint(subscription.endpoint);
        expiredCount += 1;
        continue;
      }

      this.logger.error(
        `Push delivery failed for endpoint ${subscription?.endpoint ?? 'unknown'}.`,
        deliveryResult.reason instanceof Error
          ? deliveryResult.reason.stack
          : String(deliveryResult.reason),
      );
    }

    return { deliveredCount, expiredCount };
  }

  private ensureConfigured(): void {
    if (this.publicKey === null) {
      throw new ServiceUnavailableException({
        errorCode: ERROR_CODES.NOTIFICATIONS_NOT_CONFIGURED,
        message: ERROR_MESSAGES.NOTIFICATIONS_NOT_CONFIGURED,
      });
    }
  }
}
