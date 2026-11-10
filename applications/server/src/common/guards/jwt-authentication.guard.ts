import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { ERROR_CODES, ERROR_MESSAGES } from '@habit-tracker/contracts';

import {
  AUTHENTICATION_COOKIE_NAME,
  AUTHENTICATION_OUTCOMES,
  type AuthenticationOutcome,
} from '../constants/authentication.constants';
import { OPTIONAL_AUTHENTICATION_METADATA_KEY } from '../decorators/optional-authentication.decorator';
import { PUBLIC_ROUTE_METADATA_KEY } from '../decorators/public.decorator';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';
import { AuthenticationSessionRepository } from '../../authentication/authentication-session.repository';

type AuthenticationTokenPayload = {
  sub?: string;
  sessionIdentifier?: string;
};

@Injectable()
export class JwtAuthenticationGuard implements CanActivate {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly authenticationSessionRepository: AuthenticationSessionRepository,
    private readonly reflector: Reflector,
  ) {}

  public async canActivate(executionContext: ExecutionContext): Promise<boolean> {
    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_METADATA_KEY, [
      executionContext.getHandler(),
      executionContext.getClass(),
    ]);

    if (isPublicRoute === true) {
      return true;
    }

    const isAuthenticationOptional = this.reflector.getAllAndOverride<boolean>(
      OPTIONAL_AUTHENTICATION_METADATA_KEY,
      [executionContext.getHandler(), executionContext.getClass()],
    );

    const request = executionContext.switchToHttp().getRequest<AuthenticatedRequest>();
    const authenticationOutcome = await this.authenticateRequest(request);

    if (authenticationOutcome === AUTHENTICATION_OUTCOMES.AUTHENTICATED) {
      return true;
    }

    if (isAuthenticationOptional) {
      return true;
    }

    if (authenticationOutcome === AUTHENTICATION_OUTCOMES.SESSION_REVOKED) {
      throw new UnauthorizedException({
        errorCode: ERROR_CODES.AUTHENTICATION_SESSION_REVOKED,
        message: ERROR_MESSAGES.AUTHENTICATION_SESSION_REVOKED,
      });
    }

    throw new UnauthorizedException({
      errorCode: ERROR_CODES.UNAUTHENTICATED,
      message: ERROR_MESSAGES.UNAUTHENTICATED,
    });
  }

  /**
   * Resolves the cookie token against the session whitelist. A validly signed
   * token whose session row is missing, revoked, or expired is reported as
   * revoked so the client knows that signing in again is required.
   */
  private async authenticateRequest(request: AuthenticatedRequest): Promise<AuthenticationOutcome> {
    const token = request.cookies?.[AUTHENTICATION_COOKIE_NAME] as string | undefined;

    if (token === undefined || token.length === 0) {
      return AUTHENTICATION_OUTCOMES.UNAUTHENTICATED;
    }

    const tokenPayload = await this.verifyToken(token);
    const sessionIdentifier = tokenPayload?.sessionIdentifier;

    if (sessionIdentifier === undefined) {
      return AUTHENTICATION_OUTCOMES.UNAUTHENTICATED;
    }

    // The session row is the whitelist: a valid signature alone is not enough.
    const authenticationSession =
      await this.authenticationSessionRepository.findActiveWithUser(sessionIdentifier);

    if (authenticationSession === null) {
      return AUTHENTICATION_OUTCOMES.SESSION_REVOKED;
    }

    request.authenticationSessionIdentifier = authenticationSession.identifier;
    request.authenticatedUser = {
      identifier: authenticationSession.user.identifier,
      email: authenticationSession.user.email,
      displayName: authenticationSession.user.displayName,
      timeZone: authenticationSession.user.timeZone,
    };

    return AUTHENTICATION_OUTCOMES.AUTHENTICATED;
  }

  private async verifyToken(token: string): Promise<AuthenticationTokenPayload | null> {
    try {
      return await this.jwtService.verifyAsync<AuthenticationTokenPayload>(token);
    } catch {
      return null;
    }
  }
}
