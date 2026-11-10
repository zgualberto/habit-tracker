import { addDaysToLocalDate, getCurrentLocalDate } from '../src/domain/local-date.utility';
import {
  createAgent,
  createTestContext,
  registerUser,
  resetDatabase,
  SECONDARY_TEST_USER,
  TEST_USER,
  type TestContext,
} from './test-application';

const DAILY_HABIT_PAYLOAD = {
  name: 'Morning run',
  description: 'Thirty minutes before breakfast.',
  cadence: 'DAILY',
  targetType: 'BOOLEAN',
};

describe('Habits (end-to-end)', () => {
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

  async function createHabit(
    agent: ReturnType<typeof createAgent>,
    payload: Record<string, unknown> = DAILY_HABIT_PAYLOAD,
  ): Promise<string> {
    const response = await agent.post('/api/habits').send(payload);
    expect(response.status).toBe(201);
    return response.body.habit.identifier as string;
  }

  it('creates, lists, and reads a habit', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);

    const habitIdentifier = await createHabit(agent);

    const listingResponse = await agent.get('/api/habits');
    expect(listingResponse.status).toBe(200);
    expect(listingResponse.body.habits).toHaveLength(1);
    expect(listingResponse.body.habits[0]).toMatchObject({
      identifier: habitIdentifier,
      name: DAILY_HABIT_PAYLOAD.name,
      currentStreak: 0,
      longestStreak: 0,
    });

    const detailResponse = await agent.get(`/api/habits/${habitIdentifier}`);
    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.habit.identifier).toBe(habitIdentifier);
  });

  it('validates habit rules', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);

    const response = await agent.post('/api/habits').send({
      name: 'Gym',
      cadence: 'WEEKDAYS',
      weekdays: [],
      targetType: 'BOOLEAN',
    });

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe('VALIDATION_FAILED');
  });

  it('updates a habit and validates the merged result', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);
    const habitIdentifier = await createHabit(agent);

    const updateResponse = await agent
      .patch(`/api/habits/${habitIdentifier}`)
      .send({ cadence: 'WEEKDAYS', weekdays: [1, 2, 3] });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.habit).toMatchObject({
      cadence: 'WEEKDAYS',
      weekdays: [1, 2, 3],
    });

    const invalidUpdateResponse = await agent
      .patch(`/api/habits/${habitIdentifier}`)
      .send({ cadence: 'WEEKLY_TARGET' });

    expect(invalidUpdateResponse.status).toBe(400);
    expect(invalidUpdateResponse.body.errorCode).toBe('VALIDATION_FAILED');
  });

  it('archives a habit and hides it from the active listing', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);
    const habitIdentifier = await createHabit(agent);

    const archiveResponse = await agent.delete(`/api/habits/${habitIdentifier}`);
    expect(archiveResponse.status).toBe(200);
    expect(archiveResponse.body.habit.archivedAt).not.toBeNull();

    const activeListingResponse = await agent.get('/api/habits');
    expect(activeListingResponse.body.habits).toHaveLength(0);

    const archivedListingResponse = await agent.get('/api/habits?status=archived');
    expect(archivedListingResponse.body.habits).toHaveLength(1);
  });

  it('records a check-in and reflects it on the today screen', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);
    const habitIdentifier = await createHabit(agent);
    const localDate = getCurrentLocalDate(TEST_USER.timeZone);

    const checkInResponse = await agent
      .put(`/api/habits/${habitIdentifier}/logs/${localDate}`)
      .send({ completionValue: 1 });

    expect(checkInResponse.status).toBe(200);
    expect(checkInResponse.body.log).toMatchObject({ localDate, completionValue: 1 });

    const todayResponse = await agent.get(`/api/today?localDate=${localDate}`);
    expect(todayResponse.status).toBe(200);
    expect(todayResponse.body).toMatchObject({
      localDate,
      dueCount: 1,
      completedCount: 1,
    });
    expect(todayResponse.body.habits[0]).toMatchObject({
      isDue: true,
      isCompleted: true,
    });

    const detailResponse = await agent.get(`/api/habits/${habitIdentifier}`);
    expect(detailResponse.body.habit.currentStreak).toBe(1);
  });

  it('rejects a check-in in the future', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);
    const habitIdentifier = await createHabit(agent);
    const futureLocalDate = addDaysToLocalDate(getCurrentLocalDate(TEST_USER.timeZone), 1);

    const response = await agent
      .put(`/api/habits/${habitIdentifier}/logs/${futureLocalDate}`)
      .send({ completionValue: 1 });

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe('VALIDATION_FAILED');
  });

  it('deletes a check-in and returns 404 for a missing one', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);
    const habitIdentifier = await createHabit(agent);
    const localDate = getCurrentLocalDate(TEST_USER.timeZone);

    await agent
      .put(`/api/habits/${habitIdentifier}/logs/${localDate}`)
      .send({ completionValue: 1 });

    const deletionResponse = await agent.delete(`/api/habits/${habitIdentifier}/logs/${localDate}`);
    expect(deletionResponse.status).toBe(204);

    const repeatedDeletionResponse = await agent.delete(
      `/api/habits/${habitIdentifier}/logs/${localDate}`,
    );
    expect(repeatedDeletionResponse.status).toBe(404);
    expect(repeatedDeletionResponse.body.errorCode).toBe('HABIT_LOG_NOT_FOUND');
  });

  it('does not expose another user habit', async () => {
    const ownerAgent = createAgent(testContext.application);
    await registerUser(ownerAgent);
    const habitIdentifier = await createHabit(ownerAgent);

    const otherAgent = createAgent(testContext.application);
    await registerUser(otherAgent, SECONDARY_TEST_USER);

    const response = await otherAgent.get(`/api/habits/${habitIdentifier}`);

    expect(response.status).toBe(404);
    expect(response.body.errorCode).toBe('HABIT_NOT_FOUND');
  });

  it('returns an insight summary for a date range', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);
    const habitIdentifier = await createHabit(agent);
    const localDate = getCurrentLocalDate(TEST_USER.timeZone);
    const fromLocalDate = addDaysToLocalDate(localDate, -6);

    await agent
      .put(`/api/habits/${habitIdentifier}/logs/${localDate}`)
      .send({ completionValue: 1 });

    const response = await agent.get(
      `/api/insights?fromLocalDate=${fromLocalDate}&toLocalDate=${localDate}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      fromLocalDate,
      toLocalDate: localDate,
      completedCount: 1,
      dueCount: 7,
      activeHabitCount: 1,
      bestCurrentStreak: 1,
    });
    expect(response.body.dailySeries).toHaveLength(7);
    expect(response.body.habitBreakdown[0].habitIdentifier).toBe(habitIdentifier);
  });

  it('rejects an insight range that is too long', async () => {
    const agent = createAgent(testContext.application);
    await registerUser(agent);
    const localDate = getCurrentLocalDate(TEST_USER.timeZone);
    const fromLocalDate = addDaysToLocalDate(localDate, -400);

    const response = await agent.get(
      `/api/insights?fromLocalDate=${fromLocalDate}&toLocalDate=${localDate}`,
    );

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe('VALIDATION_FAILED');
  });
});
