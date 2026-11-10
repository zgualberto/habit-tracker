import { createPinia, setActivePinia } from 'pinia';

import type { TodayResponse } from '@habit-tracker/contracts';

import { habitService } from '../services/habit.service';
import { todayService } from '../services/today.service';
import { useTodayStore } from './today.store';

vi.mock('../services/today.service', () => ({
  todayService: { getToday: vi.fn() },
}));
vi.mock('../services/habit.service', () => ({
  habitService: { upsertLog: vi.fn(), deleteLog: vi.fn() },
}));

const countableEntry: TodayResponse['habits'][number] = {
  habit: {
    identifier: '11111111-1111-4111-8111-111111111111',
    name: 'Drink water',
    description: null,
    cadence: 'DAILY',
    weekdays: [],
    weeklyTarget: null,
    targetType: 'COUNT',
    targetValue: 8,
    reminderTime: null,
    archivedAt: null,
    createdAt: '2026-11-01T00:00:00.000Z',
    currentStreak: 0,
    longestStreak: 2,
  },
  log: null,
  isDue: true,
  isCompleted: false,
};

describe('today store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('loads the entries and computes the completion percentage', async () => {
    vi.mocked(todayService.getToday).mockResolvedValue({
      localDate: '2026-11-10',
      habits: [countableEntry],
      dueCount: 4,
      completedCount: 1,
    });

    const todayStore = useTodayStore();
    await todayStore.loadToday('2026-11-10');

    expect(todayStore.entries).toHaveLength(1);
    expect(todayStore.completionPercentage).toBe(25);
  });

  it('checks in with the habit target value and reloads', async () => {
    vi.mocked(todayService.getToday).mockResolvedValue({
      localDate: '2026-11-10',
      habits: [countableEntry],
      dueCount: 1,
      completedCount: 0,
    });
    vi.mocked(habitService.upsertLog).mockResolvedValue({
      log: {
        identifier: '22222222-2222-4222-8222-222222222222',
        habitIdentifier: countableEntry.habit.identifier,
        localDate: '2026-11-10',
        completionValue: 8,
        note: null,
        createdAt: '2026-11-10T00:00:00.000Z',
        updatedAt: '2026-11-10T00:00:00.000Z',
      },
    });

    const todayStore = useTodayStore();
    await todayStore.loadToday('2026-11-10');
    await todayStore.toggleCompletion(countableEntry);

    expect(habitService.upsertLog).toHaveBeenCalledWith(
      countableEntry.habit.identifier,
      '2026-11-10',
      { completionValue: 8, note: null },
    );
    expect(todayService.getToday).toHaveBeenCalledTimes(2);
  });
});
