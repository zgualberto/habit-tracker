import { mount } from '@vue/test-utils';

import WeekdaySelector from './WeekdaySelector.vue';

describe('WeekdaySelector', () => {
  it('emits the updated weekday selection on toggle', async () => {
    const wrapper = mount(WeekdaySelector, { props: { modelValue: [1] } });

    await wrapper.find('button[aria-label="Tuesday"]').trigger('click');
    await wrapper.find('button[aria-label="Monday"]').trigger('click');

    const emittedValues = wrapper.emitted('update:modelValue') ?? [];
    expect(emittedValues[0]?.[0]).toEqual([1, 2]);
    expect(emittedValues[1]?.[0]).toEqual([2]);
  });
});
