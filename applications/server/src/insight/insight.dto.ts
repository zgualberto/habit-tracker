import { createZodDto } from 'nestjs-zod';

import { insightQuerySchema } from '@habit-tracker/contracts';

export class InsightQueryDto extends createZodDto(insightQuerySchema) {}
