import { ERROR_CODES, ERROR_MESSAGES } from '@habit-tracker/contracts';

import { ApiError } from '../services/api-client';
import { toUserMessage } from './error.utility';

describe('error utility', () => {
  it('combines the message with API validation details', () => {
    const apiError = new ApiError(
      400,
      ERROR_CODES.VALIDATION_FAILED,
      ERROR_MESSAGES.VALIDATION_FAILED,
      ['name: Required'],
    );

    expect(toUserMessage(apiError)).toContain('name: Required');
  });

  it('falls back to the internal error message for unknown values', () => {
    expect(toUserMessage({ unexpected: true })).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
  });
});
