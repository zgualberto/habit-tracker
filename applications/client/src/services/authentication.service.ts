import {
  AUTHENTICATION_RESOURCE_ACTIONS,
  type AuthenticationResponse,
  type LoginRequest,
  type RegistrationRequest,
  type UpdateProfileRequest,
} from '@habit-tracker/contracts';

import { HTTP_METHODS } from '../constants/application.constants';
import { buildAuthenticationApiPath } from '../constants/api-paths.utility';
import { apiRequest } from './api-client';

export const authenticationService = {
  register(request: RegistrationRequest): Promise<AuthenticationResponse> {
    return apiRequest<AuthenticationResponse>(
      buildAuthenticationApiPath(AUTHENTICATION_RESOURCE_ACTIONS.REGISTRATION),
      { method: HTTP_METHODS.POST, body: request },
    );
  },

  login(request: LoginRequest): Promise<AuthenticationResponse> {
    return apiRequest<AuthenticationResponse>(
      buildAuthenticationApiPath(AUTHENTICATION_RESOURCE_ACTIONS.LOGIN),
      {
        method: HTTP_METHODS.POST,
        body: request,
        suppressAuthenticationRedirect: true,
      },
    );
  },

  logout(): Promise<void> {
    return apiRequest<void>(buildAuthenticationApiPath(AUTHENTICATION_RESOURCE_ACTIONS.LOGOUT), {
      method: HTTP_METHODS.POST,
      suppressAuthenticationRedirect: true,
    });
  },

  getProfile(): Promise<AuthenticationResponse> {
    return apiRequest<AuthenticationResponse>(
      buildAuthenticationApiPath(AUTHENTICATION_RESOURCE_ACTIONS.PROFILE),
      { suppressAuthenticationRedirect: true },
    );
  },

  updateProfile(request: UpdateProfileRequest): Promise<AuthenticationResponse> {
    return apiRequest<AuthenticationResponse>(
      buildAuthenticationApiPath(AUTHENTICATION_RESOURCE_ACTIONS.PROFILE),
      { method: HTTP_METHODS.PATCH, body: request },
    );
  },
};
