import type { CreatePushSubscriptionRequest } from '@habit-tracker/contracts';

export function convertVapidPublicKey(publicKey: string): ArrayBuffer {
  const paddedPublicKey = `${publicKey}${'='.repeat((4 - (publicKey.length % 4)) % 4)}`;
  const normalisedPublicKey = paddedPublicKey.replace(/-/g, '+').replace(/_/g, '/');
  const binaryString = window.atob(normalisedPublicKey);
  const keyBuffer = new ArrayBuffer(binaryString.length);
  const keyBytes = new Uint8Array(keyBuffer);

  for (let characterIndex = 0; characterIndex < binaryString.length; characterIndex += 1) {
    keyBytes[characterIndex] = binaryString.charCodeAt(characterIndex);
  }

  return keyBuffer;
}

export function toCreatePushSubscriptionRequest(
  subscription: PushSubscriptionJSON,
): CreatePushSubscriptionRequest {
  const endpoint = subscription.endpoint;
  const publicKey = subscription.keys?.p256dh;
  const authenticationSecret = subscription.keys?.auth;

  if (endpoint === undefined || publicKey === undefined || authenticationSecret === undefined) {
    throw new Error('The browser did not provide complete push subscription keys.');
  }

  return {
    endpoint,
    keys: {
      p256dh: publicKey,
      auth: authenticationSecret,
    },
  };
}
