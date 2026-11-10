import { Injectable } from '@nestjs/common';
import type { PushSubscription } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export type UpsertPushSubscriptionInput = {
  userIdentifier: string;
  endpoint: string;
  p256dh: string;
  authentication: string;
  userAgent: string | null;
};

@Injectable()
export class PushSubscriptionRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async upsert(input: UpsertPushSubscriptionInput): Promise<PushSubscription> {
    return this.prismaService.pushSubscription.upsert({
      where: { endpoint: input.endpoint },
      create: {
        userIdentifier: input.userIdentifier,
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        authentication: input.authentication,
        userAgent: input.userAgent,
      },
      // Re-subscribing the same browser moves it to the current account and
      // refreshes the encryption keys without creating a duplicate row.
      update: {
        userIdentifier: input.userIdentifier,
        p256dh: input.p256dh,
        authentication: input.authentication,
        userAgent: input.userAgent,
      },
    });
  }

  public findManyByUser(userIdentifier: string): Promise<PushSubscription[]> {
    return this.prismaService.pushSubscription.findMany({
      where: { userIdentifier },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async deleteByIdentifier(identifier: string, userIdentifier: string): Promise<number> {
    const deletionResult = await this.prismaService.pushSubscription.deleteMany({
      where: { identifier, userIdentifier },
    });
    return deletionResult.count;
  }

  public async deleteByEndpoint(endpoint: string): Promise<number> {
    const deletionResult = await this.prismaService.pushSubscription.deleteMany({
      where: { endpoint },
    });
    return deletionResult.count;
  }
}
