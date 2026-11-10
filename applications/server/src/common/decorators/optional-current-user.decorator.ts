import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { AuthenticatedRequest, AuthenticatedUser } from '../types/authenticated-request.type';

/**
 * Returns the authenticated user when optional authentication succeeded and
 * `undefined` for anonymous requests.
 */
export const OptionalCurrentUser = createParamDecorator(
  (_data: unknown, executionContext: ExecutionContext): AuthenticatedUser | undefined => {
    const request = executionContext.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.authenticatedUser;
  },
);
