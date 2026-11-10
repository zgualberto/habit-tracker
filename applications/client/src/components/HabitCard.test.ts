import { mount, RouterLinkStub } from '@vue/test-utils';

import type { Habit } from '@habit-tracker/contracts';

import HabitCard from './HabitCard.vue';

const habitFixture: Habit = {
  identifier: '66666666-6666-4666-8666-666666666666',
  name: 'Morning run',
  description: 'Thirty minutes before breakfast.',
  cadence: 'WEEKDAYS',
  weekdays: [1, 3, 5],
  weeklyTarget: null,
  targetType: 'BOOLEAN',
  targetValue: null,
  reminderTime: '06:30',
  archivedAt: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  currentStreak: 4,
  longestStreak: 9,
};

describe('HabitCard', () => {
  it('renders the schedule, streak, and target summary', () => {
    const wrapper = mount(HabitCard, {
      props: { habit: habitFixture, isCompleted: true },
      global: { stubs: { RouterLink: RouterLinkStub } },
    });

    expect(wrapper.text()).toContain('Morning run');
    expect(wrapper.text()).toContain('Mon, Wed, Fri');
    expect(wrapper.text()).toContain('Best streak: 9 days');
    expect(wrapper.text()).toContain('Completed');
  });

  it('emits a completion toggle from the check-in button', async () => {
    const wrapper = mount(HabitCard, {
      props: { habit: habitFixture },
      global: { stubs: { RouterLink: RouterLinkStub } },
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('toggleCompletion')).toHaveLength(1);
  });

  it('hides the check-in action when the habit is not scheduled today', () => {
    const wrapper = mount(HabitCard, {
      props: { habit: habitFixture, isDue: false },
      global: { stubs: { RouterLink: RouterLinkStub } },
    });

    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.text()).toContain('Not scheduled today');
  });
});
