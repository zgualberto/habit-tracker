import { mount } from '@vue/test-utils';

import BaseButton from './BaseButton.vue';

describe('BaseButton', () => {
  it('emits a click event when pressed', async () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Save habit' } });

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toHaveLength(1);
    expect(wrapper.text()).toContain('Save habit');
  });

  it('does not emit while disabled', async () => {
    const wrapper = mount(BaseButton, { props: { isDisabled: true } });

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeUndefined();
    expect(wrapper.attributes('disabled')).toBeDefined();
  });
});
