import type { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';

import { API_BASE_PATH_SEGMENT } from '@habit-tracker/contracts';

import { ApiExceptionFilter } from './common/filters/api-exception.filter';

export function configureApplication(application: INestApplication, clientOrigin: string): void {
  application.use(cookieParser());
  application.setGlobalPrefix(API_BASE_PATH_SEGMENT);
  application.enableCors({ origin: clientOrigin, credentials: true });
  application.useGlobalPipes(new ZodValidationPipe());
  application.useGlobalFilters(new ApiExceptionFilter());
}
