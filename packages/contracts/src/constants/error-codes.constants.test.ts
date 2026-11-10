import { describe, expect, it } from 'vitest';

import { ERROR_CODES, ERROR_MESSAGES } from './error-codes.constants';

describe('error codes', () => {
  it('gives every error code a human-readable message', () => {
    for (const errorCode of Object.values(ERROR_CODES)) {
      expect(ERROR_MESSAGES[errorCode]).toBeTypeOf('string');
      expect(ERROR_MESSAGES[errorCode].length).toBeGreaterThan(0);
    }
  });

  it('keeps the revoked session distinct from an unauthenticated request', () => {
    expect(ERROR_CODES.AUTHENTICATION_SESSION_REVOKED).not.toBe(ERROR_CODES.UNAUTHENTICATED);
    expect(ERROR_MESSAGES.AUTHENTICATION_SESSION_REVOKED).toContain('sign in again');
  });
});
