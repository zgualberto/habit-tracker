import { Injectable, NotFoundException } from '@nestjs/common';
import type { PushSubscription } from '@prisma/client';

import {
  ERROR_CODES,
  ERROR_MESSAGES,
  type CreatePushSubscriptionRequest,
  type PushSubscriptionListingResponse,
  type PushSubscription as PushSubscriptionResponse,
} from '@habit-tracker/contracts';

import type { AuthenticatedUser } from '../common/types/authenticated-request.type';
import { PushSubscriptionRepository } from './push-subscription.repository';

@Injectable()
export class PushSubscriptionService {
  public constructor(private readonly pushSubscriptionRepository: PushSubscriptionRepository) {}

  public async listSubscriptions(
    authenticatedUser: AuthenticatedUser,
  ): Promise<PushSubscriptionListingResponse> {
    const subscriptions = await this.pushSubscriptionRepository.findManyByUser(
      authenticatedUser.identifier,
    );

    return { subscriptions: subscriptions.map((subscription) => this.toResponse(subscription)) };
  }

  public async createSubscription(
    authenticatedUser: AuthenticatedUser,
    request: CreatePushSubscriptionRequest,
    userAgent: string | undefined,
  ): Promise<PushSubscriptionResponse> {
    const subscription = await this.pushSubscriptionRepository.upsert({
      userIdentifier: authenticatedUser.identifier,
      endpoint: request.endpoint,
      p256dh: request.keys.p256dh,
      authentication: request.keys.auth,
      userAgent: userAgent ?? null,
    });

    return this.toResponse(subscription);
  }

  public async deleteSubscription(
    authenticatedUser: AuthenticatedUser,
    identifier: string,
  ): Promise<void> {
    const deletedCount = await this.pushSubscriptionRepository.deleteByIdentifier(
      identifier,
      authenticatedUser.identifier,
    );

    if (deletedCount === 0) {
      throw new NotFoundException({
        errorCode: ERROR_CODES.NOTIFICATION_SUBSCRIPTION_NOT_FOUND,
        message: ERROR_MESSAGES.NOTIFICATION_SUBSCRIPTION_NOT_FOUND,
      });
    }
  }

  private toResponse(subscription: PushSubscription): PushSubscriptionResponse {
    return {
      identifier: subscription.identifier,
      endpoint: subscription.endpoint,
      createdAt: subscription.createdAt.toISOString(),
    };
  }
}
