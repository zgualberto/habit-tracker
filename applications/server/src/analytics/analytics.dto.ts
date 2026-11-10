import { createZodDto } from 'nestjs-zod';

import { analyticsEventRequestSchema, analyticsQuerySchema } from '@habit-tracker/contracts';

export class AnalyticsEventRequestDto extends createZodDto(analyticsEventRequestSchema) {}

export class AnalyticsQueryDto extends createZodDto(analyticsQuerySchema) {}
