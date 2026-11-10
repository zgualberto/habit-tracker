import {
  createAgent,
  createTestContext,
  registerUser,
  resetDatabase,
  TEST_USER,
  type TestContext,
} from './test-application';

function readAuthenticationCookie(response: { headers: Record<string, unknown> }): string {
  const setCookieHeader = response.headers['set-cookie'];
  const cookieValues = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [String(setCookieHeader ?? '')];
  const authenticationCookie = cookieValues.find((cookieValue) =>
    cookieValue.startsWith('habit_tracker_authentication='),
  );

  if (authenticationCookie === undefined) {
    throw new Error('The authentication cookie was not set.');
  }

  return authenticationCookie.split(';')[0] ?? '';
}

describe('Authentication (end-to-end)', () => {
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

  it('registers a user and returns an httpOnly session cookie', async () => {
    const agent = createAgent(testContext.application);
    const response = await registerUser(agent);

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      email: TEST_USER.email,
      displayName: TEST_USER.displayName,
      timeZone: TEST_USER.timeZone,
    });
    expect(response.body.user).not.toHaveProperty('passwordHash');
    expect(String(response.headers['set-cookie'])).toContain('HttpOnly');
  });

  it('rejects a duplicate registration', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);
    const duplicateResponse = await registerUser(agent);

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.errorCode).toBe('EMAIL_ALREADY_REGISTERED');
  });

  it('signs in, reads the profile, and signs out', async () => {
    const registrationAgent = createAgent(testContext.application);
    await registerUser(registrationAgent);

    const agent = createAgent(testContext.application);
    const loginResponse = await agent.post('/api/authentication/login').send({
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    expect(loginResponse.status).toBe(200);

    const profileResponse = await agent.get('/api/authentication/me');
    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.user.email).toBe(TEST_USER.email);

    const logoutResponse = await agent.post('/api/authentication/logout');
    expect(logoutResponse.status).toBe(204);

    const afterLogoutResponse = await agent.get('/api/authentication/me');
    expect(afterLogoutResponse.status).toBe(401);
  });

  it('rejects a token that belongs to a revoked session', async () => {
    const agent = createAgent(testContext.application);
    const registrationResponse = await registerUser(agent);
    const authenticationCookie = readAuthenticationCookie(registrationResponse);

    await agent.post('/api/authentication/logout').expect(204);

    // The cookie value is replayed directly because the agent already cleared it.
    const replayResponse = await createAgent(testContext.application)
      .get('/api/authentication/me')
      .set('Cookie', authenticationCookie);

    expect(replayResponse.status).toBe(401);
    expect(replayResponse.body.errorCode).toBe('AUTHENTICATION_SESSION_REVOKED');
  });

  it('rejects invalid credentials', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);

    const response = await createAgent(testContext.application)
      .post('/api/authentication/login')
      .send({ email: TEST_USER.email, password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.body.errorCode).toBe('INVALID_CREDENTIALS');
  });

  it('validates the registration payload', async () => {
    const response = await createAgent(testContext.application)
      .post('/api/authentication/register')
      .send({ email: 'not-an-email', password: 'short', displayName: '', timeZone: 'Nowhere' });

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe('VALIDATION_FAILED');
    expect(response.body.details.length).toBeGreaterThan(0);
  });

  it('updates the display name and time zone', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);

    const response = await agent
      .patch('/api/authentication/me')
      .send({ displayName: 'Renamed User', timeZone: 'Asia/Manila' });

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      displayName: 'Renamed User',
      timeZone: 'Asia/Manila',
    });
  });
});
