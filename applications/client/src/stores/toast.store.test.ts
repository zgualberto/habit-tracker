import { createPinia, setActivePinia } from 'pinia';

import { TOAST_DURATION_IN_MILLISECONDS, TOAST_TYPES } from '../constants/presentation.constants';
import { useToastStore } from './toast.store';

describe('toast store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a toast and removes it after the display duration', () => {
    const toastStore = useToastStore();

    toastStore.pushToast(TOAST_TYPES.SUCCESS, 'Habit created.');
    expect(toastStore.toasts).toHaveLength(1);
    expect(toastStore.toasts[0]?.message).toBe('Habit created.');

    vi.advanceTimersByTime(TOAST_DURATION_IN_MILLISECONDS);
    expect(toastStore.toasts).toHaveLength(0);
  });
});
