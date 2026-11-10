import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ZodValidationException } from 'nestjs-zod';
import type { ZodError } from 'zod';
import type { Response } from 'express';

import {
  ERROR_CODES,
  ERROR_MESSAGES,
  type ApiErrorResponse,
  type ErrorCode,
} from '@habit-tracker/contracts';

const STATUS_CODE_TO_ERROR_CODE: Record<number, ErrorCode> = {
  [HttpStatus.BAD_REQUEST]: ERROR_CODES.VALIDATION_FAILED,
  [HttpStatus.UNAUTHORIZED]: ERROR_CODES.UNAUTHENTICATED,
  [HttpStatus.FORBIDDEN]: ERROR_CODES.UNAUTHENTICATED,
  [HttpStatus.NOT_FOUND]: ERROR_CODES.RESOURCE_NOT_FOUND,
  [HttpStatus.TOO_MANY_REQUESTS]: ERROR_CODES.RATE_LIMITED,
  [HttpStatus.INTERNAL_SERVER_ERROR]: ERROR_CODES.INTERNAL_ERROR,
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  public catch(exception: unknown, argumentsHost: ArgumentsHost): void {
    const response = argumentsHost.switchToHttp().getResponse<Response>();

    if (exception instanceof ZodValidationException) {
      const details = (exception.getZodError() as ZodError).issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      this.writeError(response, HttpStatus.BAD_REQUEST, {
        errorCode: ERROR_CODES.VALIDATION_FAILED,
        message: ERROR_MESSAGES.VALIDATION_FAILED,
        details,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const errorCode = this.resolveErrorCode(statusCode, exceptionResponse);
      const message = this.resolveMessage(statusCode, exceptionResponse, errorCode);
      this.writeError(response, statusCode, { errorCode, message });
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2025') {
        this.writeError(response, HttpStatus.NOT_FOUND, {
          errorCode: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        });
        return;
      }

      if (exception.code === 'P2002') {
        this.writeError(response, HttpStatus.CONFLICT, {
          errorCode: ERROR_CODES.VALIDATION_FAILED,
          message: ERROR_MESSAGES.VALIDATION_FAILED,
        });
        return;
      }
    }

    this.logger.error(
      'Unhandled exception',
      exception instanceof Error ? exception.stack : String(exception),
    );
    this.writeError(response, HttpStatus.INTERNAL_SERVER_ERROR, {
      errorCode: ERROR_CODES.INTERNAL_ERROR,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }

  private resolveErrorCode(statusCode: number, exceptionResponse: unknown): ErrorCode {
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'errorCode' in exceptionResponse &&
      typeof exceptionResponse.errorCode === 'string'
    ) {
      return exceptionResponse.errorCode as ErrorCode;
    }

    return STATUS_CODE_TO_ERROR_CODE[statusCode] ?? ERROR_CODES.INTERNAL_ERROR;
  }

  private resolveMessage(
    statusCode: number,
    exceptionResponse: unknown,
    errorCode: ErrorCode,
  ): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const exceptionMessage = exceptionResponse.message;
      if (typeof exceptionMessage === 'string') {
        return exceptionMessage;
      }
      if (Array.isArray(exceptionMessage)) {
        return exceptionMessage.join(' ');
      }
    }

    return ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.INTERNAL_ERROR;
  }

  private writeError(
    response: Response,
    statusCode: number,
    error: Omit<ApiErrorResponse, 'statusCode'>,
  ): void {
    const body: ApiErrorResponse = { statusCode, ...error };
    response.status(statusCode).json(body);
  }
}
