import {
  createAgent,
  createTestContext,
  registerUser,
  resetDatabase,
  type TestContext,
} from './test-application';

const PUSH_SUBSCRIPTION_PAYLOAD = {
  endpoint: 'https://push.example.test/subscriptions/demo-endpoint',
  keys: {
    p256dh: 'demo-public-key',
    auth: 'demo-authentication-secret',
  },
};

describe('Notifications (end-to-end)', () => {
  let testContext: TestContext;

  beforeAll(async () => {
    testContext = await createTestContext();
  });

  beforeEach(async () => {
    await resetDatabase(testContext.prismaService);
  });

  afterAll(async () => {
    await testContext.close();
  });

  it('exposes the VAPID configuration', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);

    const response = await agent.get('/api/notifications/configuration');

    expect(response.status).toBe(200);
    expect(response.body.isEnabled).toBe(true);
    expect(typeof response.body.publicKey).toBe('string');
  });

  it('registers, lists, and removes a push subscription', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);

    const creationResponse = await agent
      .post('/api/push-subscriptions')
      .send(PUSH_SUBSCRIPTION_PAYLOAD);
    expect(creationResponse.status).toBe(201);
    const subscriptionIdentifier = creationResponse.body.identifier as string;

    const listingResponse = await agent.get('/api/push-subscriptions');
    expect(listingResponse.status).toBe(200);
    expect(listingResponse.body.subscriptions).toHaveLength(1);
    expect(listingResponse.body.subscriptions[0]).toMatchObject({
      identifier: subscriptionIdentifier,
      endpoint: PUSH_SUBSCRIPTION_PAYLOAD.endpoint,
    });

    const deletionResponse = await agent.delete(
      `/api/push-subscriptions/${subscriptionIdentifier}`,
    );
    expect(deletionResponse.status).toBe(204);

    const repeatedDeletionResponse = await agent.delete(
      `/api/push-subscriptions/${subscriptionIdentifier}`,
    );
    expect(repeatedDeletionResponse.status).toBe(404);
    expect(repeatedDeletionResponse.body.errorCode).toBe('NOTIFICATION_SUBSCRIPTION_NOT_FOUND');
  });

  it('validates the subscription endpoint', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);

    const response = await agent.post('/api/push-subscriptions').send({
      endpoint: 'not-a-url',
      keys: { p256dh: '', auth: '' },
    });

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe('VALIDATION_FAILED');
  });

  it('reports zero deliveries when no subscription exists', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);

    const response = await agent.post('/api/notifications/test');

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ deliveredCount: 0, expiredCount: 0 });
  });
});
