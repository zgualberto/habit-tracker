import { z as zod } from 'zod';

import {
  DEFAULT_ANALYTICS_RETENTION_IN_DAYS,
  DEFAULT_CLIENT_ORIGIN,
  DEFAULT_SERVER_PORT,
  DEFAULT_VAPID_SUBJECT,
  MAXIMUM_ANALYTICS_RETENTION_IN_DAYS,
  MINIMUM_JWT_SECRET_LENGTH,
  NODE_ENVIRONMENTS,
} from '../common/constants/environment.constants';

export const environmentSchema = zod.object({
  NODE_ENVIRONMENT: zod
    .enum([NODE_ENVIRONMENTS.DEVELOPMENT, NODE_ENVIRONMENTS.TEST, NODE_ENVIRONMENTS.PRODUCTION])
    .default(NODE_ENVIRONMENTS.DEVELOPMENT),
  PORT: zod.coerce.number().int().min(1).max(65_535).default(DEFAULT_SERVER_PORT),
  DATABASE_URL: zod.string().min(1, { message: 'DATABASE_URL is required.' }),
  AUTHENTICATION_JWT_SECRET: zod
    .string()
    .min(MINIMUM_JWT_SECRET_LENGTH, {
      message: `AUTHENTICATION_JWT_SECRET must be at least ${MINIMUM_JWT_SECRET_LENGTH} characters long.`,
    }),
  CLIENT_ORIGIN: zod.string().url().default(DEFAULT_CLIENT_ORIGIN),
  VAPID_PUBLIC_KEY: zod.string().min(1).optional(),
  VAPID_PRIVATE_KEY: zod.string().min(1).optional(),
  VAPID_SUBJECT: zod.string().min(1).default(DEFAULT_VAPID_SUBJECT),
  ANALYTICS_RETENTION_IN_DAYS: zod.coerce
    .number()
    .int()
    .min(1)
    .max(MAXIMUM_ANALYTICS_RETENTION_IN_DAYS)
    .default(DEFAULT_ANALYTICS_RETENTION_IN_DAYS),
});

export type EnvironmentConfiguration = zod.infer<typeof environmentSchema>;

export function validateEnvironment(
  configuration: Record<string, unknown>,
): EnvironmentConfiguration {
  const validationResult = environmentSchema.safeParse(configuration);

  if (!validationResult.success) {
    const issues = validationResult.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return validationResult.data;
}
