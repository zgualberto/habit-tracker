import { z as zod } from 'zod';

export const pushSubscriptionKeysSchema = zod.object({
  p256dh: zod.string().min(1),
  auth: zod.string().min(1),
});

export const createPushSubscriptionRequestSchema = zod.object({
  endpoint: zod.string().url().max(2048),
  keys: pushSubscriptionKeysSchema,
});

export const pushSubscriptionSchema = zod.object({
  identifier: zod.string().uuid(),
  endpoint: zod.string(),
  createdAt: zod.string().datetime(),
});

export const pushSubscriptionListingResponseSchema = zod.object({
  subscriptions: zod.array(pushSubscriptionSchema),
});

export const testNotificationResponseSchema = zod.object({
  deliveredCount: zod.number().int().min(0),
  expiredCount: zod.number().int().min(0),
});

export type CreatePushSubscriptionRequest = zod.infer<typeof createPushSubscriptionRequestSchema>;
export type PushSubscription = zod.infer<typeof pushSubscriptionSchema>;
export type PushSubscriptionListingResponse = zod.infer<
  typeof pushSubscriptionListingResponseSchema
>;
export type TestNotificationResponse = zod.infer<typeof testNotificationResponseSchema>;

export const notificationConfigurationSchema = zod.object({
  isEnabled: zod.boolean(),
  publicKey: zod.string().nullable(),
});

export type NotificationConfiguration = zod.infer<typeof notificationConfigurationSchema>;

export const pushSubscriptionIdentifierParameterSchema = zod.object({
  identifier: zod.string().uuid(),
});
