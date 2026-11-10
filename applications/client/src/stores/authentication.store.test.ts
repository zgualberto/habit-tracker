import { createPinia, setActivePinia } from 'pinia';

import { authenticationService } from '../services/authentication.service';
import { useAuthenticationStore } from './authentication.store';

vi.mock('../services/authentication.service', () => ({
  authenticationService: {
    getProfile: vi.fn(),
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

const userFixture = {
  identifier: '55555555-5555-4555-8555-555555555555',
  email: 'demo@habit.app',
  displayName: 'Demo User',
  timeZone: 'Asia/Manila',
  createdAt: '2026-11-01T00:00:00.000Z',
};

describe('authentication store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('signs in and exposes the authenticated user', async () => {
    vi.mocked(authenticationService.login).mockResolvedValue({ user: userFixture });

    const authenticationStore = useAuthenticationStore();
    await authenticationStore.login({ email: userFixture.email, password: 'demo1234' });

    expect(authenticationStore.isAuthenticated).toBe(true);
    expect(authenticationStore.user?.displayName).toBe('Demo User');
  });

  it('clears local authentication even when the logout request fails', async () => {
    vi.mocked(authenticationService.getProfile).mockResolvedValue({ user: userFixture });
    vi.mocked(authenticationService.logout).mockRejectedValue(new Error('network down'));

    const authenticationStore = useAuthenticationStore();
    await authenticationStore.loadCurrentUser();

    await expect(authenticationStore.logout()).rejects.toThrow('network down');
    expect(authenticationStore.isAuthenticated).toBe(false);
    expect(authenticationStore.user).toBeNull();
  });
});
