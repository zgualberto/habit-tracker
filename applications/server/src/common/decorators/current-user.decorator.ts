import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { ERROR_CODES, ERROR_MESSAGES } from '@habit-tracker/contracts';

import type { AuthenticatedRequest, AuthenticatedUser } from '../types/authenticated-request.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, executionContext: ExecutionContext): AuthenticatedUser => {
    const request = executionContext.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.authenticatedUser === undefined) {
      throw new UnauthorizedException({
        errorCode: ERROR_CODES.UNAUTHENTICATED,
        message: ERROR_MESSAGES.UNAUTHENTICATED,
      });
    }
    return request.authenticatedUser;
  },
);
