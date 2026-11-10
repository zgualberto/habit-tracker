import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { ERROR_CODES, ERROR_MESSAGES } from '@habit-tracker/contracts';

import type { AuthenticatedRequest } from '../types/authenticated-request.type';

export const CurrentAuthenticationSession = createParamDecorator(
  (_data: unknown, executionContext: ExecutionContext): string => {
    const request = executionContext.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.authenticationSessionIdentifier === undefined) {
      throw new UnauthorizedException({
        errorCode: ERROR_CODES.UNAUTHENTICATED,
        message: ERROR_MESSAGES.UNAUTHENTICATED,
      });
    }
    return request.authenticationSessionIdentifier;
  },
);
