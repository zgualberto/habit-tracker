import {
  ERROR_CODES,
  ERROR_MESSAGES,
  type ApiErrorResponse,
  type ErrorCode,
} from '@habit-tracker/contracts';

import {
  HTTP_HEADER_NAMES,
  HTTP_HEADER_VALUES,
  HTTP_METHODS,
  HTTP_STATUS_CODES,
  REQUEST_CREDENTIALS_MODE,
} from '../constants/application.constants';
import { REQUEST_TIMEOUT_IN_MILLISECONDS } from '../constants/presentation.constants';

export const NETWORK_ERROR_STATUS_CODE = 0;

export type ApiRequestOptions = {
  method?: (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];
  body?: unknown;
  signal?: AbortSignal;
  suppressAuthenticationRedirect?: boolean;
};

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly details: readonly string[];

  public constructor(
    statusCode: number,
    errorCode: ErrorCode,
    message: string,
    details: readonly string[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }

  public get isUnauthenticated(): boolean {
    return this.statusCode === HTTP_STATUS_CODES.UNAUTHORIZED;
  }
}

type UnauthenticatedHandler = () => void;

let unauthenticatedHandler: UnauthenticatedHandler | null = null;

export function setUnauthenticatedHandler(handler: UnauthenticatedHandler): void {
  unauthenticatedHandler = handler;
}

function extractErrorMessage(errorBody: unknown): {
  errorCode: ErrorCode;
  message: string;
  details: string[];
} {
  if (typeof errorBody === 'object' && errorBody !== null) {
    const candidate = errorBody as Partial<ApiErrorResponse>;
    if (typeof candidate.message === 'string') {
      return {
        errorCode: (candidate.errorCode as ErrorCode | undefined) ?? ERROR_CODES.INTERNAL_ERROR,
        message: candidate.message,
        details: Array.isArray(candidate.details) ? [...candidate.details] : [],
      };
    }
  }

  return {
    errorCode: ERROR_CODES.INTERNAL_ERROR,
    message: ERROR_MESSAGES.INTERNAL_ERROR,
    details: [],
  };
}

export async function apiRequest<ResponseBody>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ResponseBody> {
  const requestTimeoutController = new AbortController();
  const timeoutIdentifier = window.setTimeout(
    () => requestTimeoutController.abort(),
    REQUEST_TIMEOUT_IN_MILLISECONDS,
  );

  let response: Response;
  try {
    response = await fetch(path, {
      method: options.method ?? HTTP_METHODS.GET,
      credentials: REQUEST_CREDENTIALS_MODE,
      headers: {
        [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADER_VALUES.JSON,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal ?? requestTimeoutController.signal,
    });
  } catch (error) {
    throw new ApiError(
      NETWORK_ERROR_STATUS_CODE,
      ERROR_CODES.INTERNAL_ERROR,
      ERROR_MESSAGES.INTERNAL_ERROR,
      [error instanceof Error ? error.message : String(error)],
    );
  } finally {
    window.clearTimeout(timeoutIdentifier);
  }

  if (response.status === HTTP_STATUS_CODES.NO_CONTENT) {
    return undefined as ResponseBody;
  }

  const responseBody: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorInformation = extractErrorMessage(responseBody);

    if (
      response.status === HTTP_STATUS_CODES.UNAUTHORIZED &&
      !options.suppressAuthenticationRedirect
    ) {
      unauthenticatedHandler?.();
    }

    throw new ApiError(
      response.status,
      errorInformation.errorCode,
      errorInformation.message,
      errorInformation.details,
    );
  }

  return responseBody as ResponseBody;
}

export function buildQueryString(queryValues: Record<string, string | number | undefined>): string {
  const searchParameters = new URLSearchParams();

  for (const [queryKey, queryValue] of Object.entries(queryValues)) {
    if (queryValue !== undefined) {
      searchParameters.set(queryKey, String(queryValue));
    }
  }

  const queryString = searchParameters.toString();
  return queryString.length === 0 ? '' : `?${queryString}`;
}
