import { mount } from '@vue/test-utils';

import PageAnalyticsCard from './PageAnalyticsCard.vue';

describe('PageAnalyticsCard', () => {
  it('renders the totals and the most visited paths', () => {
    const wrapper = mount(PageAnalyticsCard, {
      props: {
        summary: {
          fromLocalDate: '2026-11-01',
          toLocalDate: '2026-11-10',
          totalPageViews: 5,
          uniqueSessionCount: 3,
          dailySeries: [{ localDate: '2026-11-10', pageViewCount: 5 }],
          topPaths: [{ path: '/insights', pageViewCount: 5 }],
        },
      },
      global: { stubs: { LineChart: true } },
    });

    expect(wrapper.text()).toContain('Page analytics');
    expect(wrapper.text()).toContain('5');
    expect(wrapper.text()).toContain('3');
    expect(wrapper.text()).toContain('/insights');
  });

  it('shows the empty state when no page views were recorded', () => {
    const wrapper = mount(PageAnalyticsCard, {
      props: {
        summary: {
          fromLocalDate: '2026-11-01',
          toLocalDate: '2026-11-10',
          totalPageViews: 0,
          uniqueSessionCount: 0,
          dailySeries: [],
          topPaths: [],
        },
      },
      global: { stubs: { LineChart: true } },
    });

    expect(wrapper.text()).toContain('No page views yet');
  });
});
