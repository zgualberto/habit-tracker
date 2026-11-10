import { createAgent, createTestContext, type TestContext } from './test-application';

describe('Health (end-to-end)', () => {
  let testContext: TestContext;

  beforeAll(async () => {
    testContext = await createTestContext();
  });

  afterAll(async () => {
    await testContext.close();
  });

  it('reports the server and database as healthy without authentication', async () => {
    const response = await createAgent(testContext.application).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'healthy',
      database: 'reachable',
    });
  });

  it('rejects unauthenticated access to protected routes', async () => {
    const response = await createAgent(testContext.application).get('/api/habits');

    expect(response.status).toBe(401);
    expect(response.body.errorCode).toBe('UNAUTHENTICATED');
  });
});
