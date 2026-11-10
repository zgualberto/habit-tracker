import { createZodDto } from 'nestjs-zod';

import {
  createPushSubscriptionRequestSchema,
  pushSubscriptionIdentifierParameterSchema,
} from '@habit-tracker/contracts';

export class CreatePushSubscriptionRequestDto extends createZodDto(
  createPushSubscriptionRequestSchema,
) {}

export class PushSubscriptionIdentifierParameterDto extends createZodDto(
  pushSubscriptionIdentifierParameterSchema,
) {}
