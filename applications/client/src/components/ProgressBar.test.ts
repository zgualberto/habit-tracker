import { mount } from '@vue/test-utils';

import ProgressBar from './ProgressBar.vue';

describe('ProgressBar', () => {
  it('clamps the percentage to the supported range', () => {
    const wrapper = mount(ProgressBar, { props: { percentage: 150 } });

    expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('100');
    expect(wrapper.find('[role="progressbar"] > div').attributes('style')).toContain('width: 100%');
  });
});
