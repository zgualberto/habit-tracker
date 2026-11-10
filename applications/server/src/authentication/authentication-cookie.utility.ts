import type { CookieOptions } from 'express';

import {
  AUTHENTICATION_COOKIE_PATH,
  AUTHENTICATION_SESSION_DURATION_IN_MILLISECONDS,
} from '../common/constants/authentication.constants';

export function buildAuthenticationCookieOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: AUTHENTICATION_COOKIE_PATH,
    maxAge: AUTHENTICATION_SESSION_DURATION_IN_MILLISECONDS,
  };
}

export function buildAuthenticationCookieClearingOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: AUTHENTICATION_COOKIE_PATH,
  };
}
