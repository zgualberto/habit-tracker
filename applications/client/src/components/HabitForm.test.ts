import { mount } from '@vue/test-utils';

import HabitForm from './HabitForm.vue';

async function submitEmptyForm(wrapper: ReturnType<typeof mount>): Promise<void> {
  await wrapper.find('form').trigger('submit');
}

describe('HabitForm', () => {
  it('emits a complete create request for a valid daily habit', async () => {
    const wrapper = mount(HabitForm);

    await wrapper.find('input').setValue('Morning run');
    await wrapper.find('textarea').setValue('Thirty minutes before breakfast.');
    await submitEmptyForm(wrapper);

    const emittedRequest = wrapper.emitted('submit')?.[0]?.[0];
    expect(emittedRequest).toMatchObject({
      name: 'Morning run',
      description: 'Thirty minutes before breakfast.',
      cadence: 'DAILY',
      weekdays: [],
      targetType: 'BOOLEAN',
    });
  });

  it('blocks submission and shows a field error when the name is missing', async () => {
    const wrapper = mount(HabitForm);

    await submitEmptyForm(wrapper);

    expect(wrapper.emitted('submit')).toBeUndefined();
    expect(wrapper.text()).toContain('String must contain at least 1 character');
  });

  it('sends the selected weekdays for a weekday cadence', async () => {
    const wrapper = mount(HabitForm);
    await wrapper.find('input').setValue('Strength training');

    await wrapper.findAll('select')[0]?.setValue('WEEKDAYS');
    await wrapper.find('button[aria-label="Monday"]').trigger('click');
    await wrapper.find('button[aria-label="Wednesday"]').trigger('click');
    await submitEmptyForm(wrapper);

    const emittedRequest = wrapper.emitted('submit')?.[0]?.[0];
    expect(emittedRequest).toMatchObject({
      name: 'Strength training',
      cadence: 'WEEKDAYS',
      weekdays: [1, 3],
    });
  });

  it('prefills the form from an existing habit', () => {
    const wrapper = mount(HabitForm, {
      props: {
        initialHabit: {
          identifier: '77777777-7777-4777-8777-777777777777',
          name: 'Read twenty pages',
          description: 'Any book.',
          cadence: 'DAILY',
          weekdays: [],
          weeklyTarget: null,
          targetType: 'COUNT',
          targetValue: 20,
          reminderTime: '21:00',
          archivedAt: null,
          createdAt: '2026-11-01T00:00:00.000Z',
          currentStreak: 2,
          longestStreak: 5,
        },
      },
    });

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('Read twenty pages');
    expect(wrapper.text()).toContain('Daily target');
  });
});
