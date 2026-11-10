import {
  convertVapidPublicKey,
  toCreatePushSubscriptionRequest,
} from './push-subscription.utility';

describe('push subscription utility', () => {
  it('converts a base64 encoded VAPID key into bytes', () => {
    const keyBytes = new Uint8Array(convertVapidPublicKey('AQID'));

    expect([...keyBytes]).toEqual([1, 2, 3]);
  });

  it('rejects an incomplete browser subscription', () => {
    expect(() =>
      toCreatePushSubscriptionRequest({
        endpoint: 'https://push.example.test/subscriptions/one',
      }),
    ).toThrow('complete push subscription keys');
  });
});
