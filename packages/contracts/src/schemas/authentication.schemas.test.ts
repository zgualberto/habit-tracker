import { describe, expect, it } from 'vitest';

import {
  isSupportedTimeZone,
  loginRequestSchema,
  registrationRequestSchema,
  updateProfileRequestSchema,
} from './authentication.schemas';

describe('authentication schemas', () => {
  it('normalises the email address and applies the default time zone', () => {
    const registrationRequest = registrationRequestSchema.parse({
      email: '  Demo@Habit.App ',
      password: 'demo1234',
      displayName: '  Demo User ',
    });

    expect(registrationRequest.email).toBe('demo@habit.app');
    expect(registrationRequest.displayName).toBe('Demo User');
    expect(registrationRequest.timeZone).toBe('UTC');
  });

  it('rejects an unsupported time zone and a short password', () => {
    const validationResult = registrationRequestSchema.safeParse({
      email: 'demo@habit.app',
      password: 'short',
      displayName: 'Demo User',
      timeZone: 'Mars/Olympus_Mons',
    });

    expect(validationResult.success).toBe(false);
    expect(validationResult.error?.issues.map((issue) => issue.path[0])).toEqual([
      'password',
      'timeZone',
    ]);
  });

  it('recognises time zones through the runtime calendar database', () => {
    expect(isSupportedTimeZone('Asia/Manila')).toBe(true);
    expect(isSupportedTimeZone('Mars/Olympus_Mons')).toBe(false);
  });

  it('requires a valid email address when signing in', () => {
    expect(
      loginRequestSchema.safeParse({ email: 'not-an-email', password: 'demo1234' }).success,
    ).toBe(false);
    expect(
      loginRequestSchema.safeParse({ email: 'demo@habit.app', password: 'demo1234' }).success,
    ).toBe(true);
  });

  it('requires at least one field when updating the profile', () => {
    const validationResult = updateProfileRequestSchema.safeParse({});

    expect(validationResult.success).toBe(false);
    expect(validationResult.error?.issues[0]?.message).toBe(
      'At least one profile field must be provided.',
    );
  });
});
