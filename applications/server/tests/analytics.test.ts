import {
  createAgent,
  createTestContext,
  registerUser,
  resetDatabase,
  TEST_USER,
  type TestContext,
} from './test-application';

describe('Analytics (end-to-end)', () => {
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

  it('accepts an anonymous page view', async () => {
    const response = await createAgent(testContext.application).post('/api/analytics-events').send({
      name: 'page_view',
      path: '/login',
      sessionIdentifier: 'anonymous-session',
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ accepted: true });
  });

  it('validates the event payload', async () => {
    const response = await createAgent(testContext.application)
      .post('/api/analytics-events')
      .send({ name: 'unknown_event', path: '', sessionIdentifier: '' });

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe('VALIDATION_FAILED');
  });

  it('attributes an authenticated view to the user and summarises it', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);

    await agent
      .post('/api/analytics-events')
      .send({
        name: 'page_view',
        path: '/insights',
        sessionIdentifier: 'signed-in-session',
      })
      .expect(202);

    const summaryResponse = await agent.get('/api/analytics-summary');

    expect(summaryResponse.status).toBe(200);
    expect(summaryResponse.body).toMatchObject({
      totalPageViews: 1,
      uniqueSessionCount: 1,
    });
    expect(summaryResponse.body.topPaths).toEqual([{ path: '/insights', pageViewCount: 1 }]);
    expect(summaryResponse.body.dailySeries.length).toBeGreaterThan(0);
  });

  it('requires authentication for the summary', async () => {
    const response = await createAgent(testContext.application).get('/api/analytics-summary');

    expect(response.status).toBe(401);
    expect(response.body.errorCode).toBe('UNAUTHENTICATED');
  });

  it('rejects a reversed date range', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);

    const response = await agent.get(
      '/api/analytics-summary?fromLocalDate=2026-11-10&toLocalDate=2026-11-01',
    );

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe('VALIDATION_FAILED');
  });

  it('keeps one user from seeing another user page views', async () => {
    const firstAgent = createAgent(testContext.application);
    await registerUser(firstAgent);
    await firstAgent.post('/api/analytics-events').send({
      name: 'page_view',
      path: '/',
      sessionIdentifier: 'first-user-session',
    });

    const secondAgent = createAgent(testContext.application);
    await registerUser(secondAgent, {
      email: 'second@habit.app',
      password: 'second1234',
      displayName: 'Second User',
      timeZone: TEST_USER.timeZone,
    });

    const summaryResponse = await secondAgent.get('/api/analytics-summary');
    expect(summaryResponse.body.totalPageViews).toBe(0);
  });
});
