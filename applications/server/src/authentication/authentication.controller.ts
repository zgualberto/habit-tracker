import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import {
  API_RESOURCE_PATHS,
  type AuthenticationResponse,
  type LoginRequest,
  type RegistrationRequest,
  type UpdateProfileRequest,
} from '@habit-tracker/contracts';

import { CurrentAuthenticationSession } from '../common/decorators/current-authentication-session.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import {
  AUTHENTICATION_COOKIE_NAME,
  AUTHENTICATION_ROUTE_ACTIONS,
} from '../common/constants/authentication.constants';
import {
  ENVIRONMENT_VARIABLE_NAMES,
  NODE_ENVIRONMENTS,
} from '../common/constants/environment.constants';
import { HTTP_HEADER_NAMES } from '../common/constants/http.constants';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedUser } from '../common/types/authenticated-request.type';
import { AuthenticationService } from './authentication.service';
import {
  LoginRequestDto,
  RegistrationRequestDto,
  UpdateProfileRequestDto,
} from './authentication.dto';
import {
  buildAuthenticationCookieClearingOptions,
  buildAuthenticationCookieOptions,
} from './authentication-cookie.utility';

@Controller(API_RESOURCE_PATHS.AUTHENTICATION)
export class AuthenticationController {
  public constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly configurationService: ConfigService,
  ) {}

  @Public()
  @Post(AUTHENTICATION_ROUTE_ACTIONS.REGISTRATION)
  public async register(
    @Body() request: RegistrationRequestDto,
    @Headers(HTTP_HEADER_NAMES.USER_AGENT) userAgent: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthenticationResponse> {
    const issuedAuthentication = await this.authenticationService.register(
      request as RegistrationRequest,
      userAgent,
    );
    this.setAuthenticationCookie(response, issuedAuthentication.token);
    return { user: issuedAuthentication.user };
  }

  @Public()
  @Post(AUTHENTICATION_ROUTE_ACTIONS.LOGIN)
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() request: LoginRequestDto,
    @Headers(HTTP_HEADER_NAMES.USER_AGENT) userAgent: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthenticationResponse> {
    const issuedAuthentication = await this.authenticationService.login(
      request as LoginRequest,
      userAgent,
    );
    this.setAuthenticationCookie(response, issuedAuthentication.token);
    return { user: issuedAuthentication.user };
  }

  @Post(AUTHENTICATION_ROUTE_ACTIONS.LOGOUT)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(
    @CurrentAuthenticationSession() sessionIdentifier: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authenticationService.logout(sessionIdentifier);
    response.clearCookie(
      AUTHENTICATION_COOKIE_NAME,
      buildAuthenticationCookieClearingOptions(this.isProductionEnvironment()),
    );
  }

  @Get(AUTHENTICATION_ROUTE_ACTIONS.PROFILE)
  public getProfile(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<AuthenticationResponse> {
    return this.authenticationService.getAuthenticationResponse(authenticatedUser.identifier);
  }

  @Patch(AUTHENTICATION_ROUTE_ACTIONS.PROFILE)
  public async updateProfile(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() request: UpdateProfileRequestDto,
  ): Promise<AuthenticationResponse> {
    const user = await this.authenticationService.updateProfile(
      authenticatedUser.identifier,
      request as UpdateProfileRequest,
    );
    return { user };
  }

  private setAuthenticationCookie(response: Response, token: string): void {
    response.cookie(
      AUTHENTICATION_COOKIE_NAME,
      token,
      buildAuthenticationCookieOptions(this.isProductionEnvironment()),
    );
  }

  private isProductionEnvironment(): boolean {
    return (
      this.configurationService.get<string>(ENVIRONMENT_VARIABLE_NAMES.NODE_ENVIRONMENT) ===
      NODE_ENVIRONMENTS.PRODUCTION
    );
  }
}
