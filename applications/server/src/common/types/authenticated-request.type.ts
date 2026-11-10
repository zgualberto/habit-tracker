import type { Request } from 'express';

export type AuthenticatedUser = {
  identifier: string;
  email: string;
  displayName: string;
  timeZone: string;
};

export type AuthenticatedRequest = Request & {
  authenticatedUser?: AuthenticatedUser;
  authenticationSessionIdentifier?: string;
};
