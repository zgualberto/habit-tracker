import { z as zod } from 'zod';

import { localDateSchema } from './habit.schemas';

export const analyticsDateRangeSchema = zod
  .object({
    fromLocalDate: localDateSchema.optional(),
    toLocalDate: localDateSchema.optional(),
  })
  .refine(
    (values) =>
      values.fromLocalDate === undefined ||
      values.toLocalDate === undefined ||
      values.fromLocalDate <= values.toLocalDate,
    { message: 'The start date must not be after the end date.', path: ['fromLocalDate'] },
  );
