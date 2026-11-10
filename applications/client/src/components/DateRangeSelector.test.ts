import { mount } from '@vue/test-utils';

import DateRangeSelector from './DateRangeSelector.vue';

describe('DateRangeSelector', () => {
  it('emits the selected range in days', async () => {
    const wrapper = mount(DateRangeSelector, { props: { modelValue: 7 } });

    await wrapper.find('select').setValue('30');

    expect(wrapper.emitted('change')?.[0]?.[0]).toBe(30);
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe(30);
  });
});
