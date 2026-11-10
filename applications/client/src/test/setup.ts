import { afterEach } from 'vitest';

afterEach(() => {
  document.body.innerHTML = '';
  window.sessionStorage.clear();
});
