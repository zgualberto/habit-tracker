import { z as zod } from 'zod';

import {
  DEFAULT_TIME_ZONE,
  DISPLAY_NAME_MAXIMUM_LENGTH,
  DISPLAY_NAME_MINIMUM_LENGTH,
  EMAIL_MAXIMUM_LENGTH,
  PASSWORD_MAXIMUM_LENGTH,
  PASSWORD_MINIMUM_LENGTH,
  TIME_ZONE_MAXIMUM_LENGTH,
} from '../constants/authentication.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';

export function isSupportedTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

export const emailAddressSchema = zod
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(EMAIL_MAXIMUM_LENGTH)
  .email();

export const passwordSchema = zod
  .string()
  .min(PASSWORD_MINIMUM_LENGTH)
  .max(PASSWORD_MAXIMUM_LENGTH);

export const displayNameSchema = zod
  .string()
  .trim()
  .min(DISPLAY_NAME_MINIMUM_LENGTH)
  .max(DISPLAY_NAME_MAXIMUM_LENGTH);

export const timeZoneSchema = zod
  .string()
  .trim()
  .min(1)
  .max(TIME_ZONE_MAXIMUM_LENGTH)
  .refine(isSupportedTimeZone, { message: 'The time zone is not recognised.' })
  .default(DEFAULT_TIME_ZONE);

export const registrationRequestSchema = zod.object({
  email: emailAddressSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  timeZone: timeZoneSchema,
});

export const loginRequestSchema = zod.object({
  email: emailAddressSchema,
  password: passwordSchema,
});

export const updateProfileRequestSchema = zod
  .object({
    displayName: displayNameSchema.optional(),
    timeZone: timeZoneSchema.optional(),
  })
  .refine((values) => values.displayName !== undefined || values.timeZone !== undefined, {
    message: 'At least one profile field must be provided.',
  });

export const userProfileSchema = zod.object({
  identifier: zod.string().uuid(),
  email: emailAddressSchema,
  displayName: zod.string(),
  timeZone: zod.string(),
  createdAt: zod.string().datetime(),
});

export const authenticationResponseSchema = zod.object({
  user: userProfileSchema,
});

export const authenticationErrorResponseSchema = zod.object({
  errorCode: zod.literal(ERROR_CODES.INVALID_CREDENTIALS),
  message: zod.string(),
});

export type RegistrationRequest = zod.infer<typeof registrationRequestSchema>;
export type LoginRequest = zod.infer<typeof loginRequestSchema>;
export type UpdateProfileRequest = zod.infer<typeof updateProfileRequestSchema>;
export type UserProfile = zod.infer<typeof userProfileSchema>;
export type AuthenticationResponse = zod.infer<typeof authenticationResponseSchema>;
