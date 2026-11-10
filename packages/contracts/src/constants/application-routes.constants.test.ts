import { describe, expect, it } from 'vitest';

import {
  buildHabitDetailApiPath,
  buildHabitDetailRoutePath,
  buildHabitEditingRoutePath,
  buildHabitLogApiPath,
  buildHabitLogListingApiPath,
} from './application-routes.constants';

const habitIdentifier = '11111111-1111-4111-8111-111111111111';

describe('application routes', () => {
  it('builds the habit detail and editing paths', () => {
    expect(buildHabitDetailRoutePath(habitIdentifier)).toBe(`/habits/${habitIdentifier}`);
    expect(buildHabitEditingRoutePath(habitIdentifier)).toBe(`/habits/${habitIdentifier}/edit`);
  });

  it('encodes route and API parameters once', () => {
    expect(buildHabitDetailRoutePath('habit/with space')).toBe('/habits/habit%2Fwith%20space');
    expect(buildHabitDetailApiPath('habit/with space')).toBe('/api/habits/habit%2Fwith%20space');
  });

  it('builds the habit log API paths', () => {
    expect(buildHabitLogApiPath(habitIdentifier, '2026-11-10')).toBe(
      `/api/habits/${habitIdentifier}/logs/2026-11-10`,
    );
    expect(buildHabitLogListingApiPath(habitIdentifier)).toBe(
      `/api/habits/${habitIdentifier}/logs`,
    );
  });
});
