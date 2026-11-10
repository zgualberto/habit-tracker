import { ERROR_MESSAGES } from '@habit-tracker/contracts';

import { ApiError } from '../services/api-client';

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.details.length > 0) {
      return `${error.message} ${error.details.join(' ')}`;
    }
    return error.message;
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return ERROR_MESSAGES.INTERNAL_ERROR;
}
