import { createPinia, setActivePinia } from 'pinia';

import type { Habit } from '@habit-tracker/contracts';

import { habitService } from '../services/habit.service';
import { useHabitStore } from './habit.store';

vi.mock('../services/habit.service', () => ({
  habitService: {
    listHabits: vi.fn(),
    getHabit: vi.fn(),
    listLogs: vi.fn(),
    createHabit: vi.fn(),
    updateHabit: vi.fn(),
    archiveHabit: vi.fn(),
  },
}));

const habitFixture: Habit = {
  identifier: '33333333-3333-4333-8333-333333333333',
  name: 'Morning run',
  description: 'Thirty minutes.',
  cadence: 'DAILY',
  weekdays: [],
  weeklyTarget: null,
  targetType: 'BOOLEAN',
  targetValue: null,
  reminderTime: '06:30',
  archivedAt: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  currentStreak: 3,
  longestStreak: 7,
};

describe('habit store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('prepends a created habit to the active listing', async () => {
    vi.mocked(habitService.createHabit).mockResolvedValue({ habit: habitFixture });

    const habitStore = useHabitStore();
    const createdHabit = await habitStore.createHabit({
      name: habitFixture.name,
      description: null,
      cadence: 'DAILY',
      weekdays: [],
      weeklyTarget: null,
      targetType: 'BOOLEAN',
      targetValue: null,
      reminderTime: null,
    });

    expect(createdHabit.identifier).toBe(habitFixture.identifier);
    expect(habitStore.habits).toHaveLength(1);
  });

  it('loads the selected habit together with its logs', async () => {
    vi.mocked(habitService.getHabit).mockResolvedValue({ habit: habitFixture });
    vi.mocked(habitService.listLogs).mockResolvedValue({
      logs: [
        {
          identifier: '44444444-4444-4444-8444-444444444444',
          habitIdentifier: habitFixture.identifier,
          localDate: '2026-11-10',
          completionValue: 1,
          note: null,
          createdAt: '2026-11-10T00:00:00.000Z',
          updatedAt: '2026-11-10T00:00:00.000Z',
        },
      ],
    });

    const habitStore = useHabitStore();
    await habitStore.loadHabit(habitFixture.identifier);

    expect(habitStore.selectedHabit?.identifier).toBe(habitFixture.identifier);
    expect(habitStore.selectedHabitLogs).toHaveLength(1);
  });

  it('removes an archived habit from the listing and clears the selection', async () => {
    vi.mocked(habitService.getHabit).mockResolvedValue({ habit: habitFixture });
    vi.mocked(habitService.listLogs).mockResolvedValue({ logs: [] });
    vi.mocked(habitService.archiveHabit).mockResolvedValue({
      habit: { ...habitFixture, archivedAt: '2026-11-10T00:00:00.000Z' },
    });

    const habitStore = useHabitStore();
    await habitStore.loadHabit(habitFixture.identifier);
    habitStore.habits = [habitFixture];
    await habitStore.archiveHabit(habitFixture.identifier);

    expect(habitStore.habits).toHaveLength(0);
    expect(habitStore.selectedHabit).toBeNull();
  });
});
