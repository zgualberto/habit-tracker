import { z as zod } from 'zod';

import { ERROR_CODES } from '../constants/error-codes.constants';

export const apiErrorResponseSchema = zod.object({
  statusCode: zod.number().int(),
  errorCode: zod.enum(Object.values(ERROR_CODES) as [string, ...string[]]),
  message: zod.string(),
  details: zod.array(zod.string()).optional(),
});

export type ApiErrorResponse = zod.infer<typeof apiErrorResponseSchema>;
