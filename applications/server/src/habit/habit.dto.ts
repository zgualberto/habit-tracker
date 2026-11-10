import { createZodDto } from 'nestjs-zod';

import {
  createHabitRequestSchema,
  habitIdentifierParameterSchema,
  habitListingQuerySchema,
  habitLogParameterSchema,
  habitLogQuerySchema,
  todayQuerySchema,
  updateHabitRequestSchema,
  upsertHabitLogRequestSchema,
} from '@habit-tracker/contracts';

export class HabitListingQueryDto extends createZodDto(habitListingQuerySchema) {}

export class CreateHabitRequestDto extends createZodDto(createHabitRequestSchema) {}

export class UpdateHabitRequestDto extends createZodDto(updateHabitRequestSchema) {}

export class HabitIdentifierParameterDto extends createZodDto(habitIdentifierParameterSchema) {}

export class HabitLogParameterDto extends createZodDto(habitLogParameterSchema) {}

export class HabitLogQueryDto extends createZodDto(habitLogQuerySchema) {}

export class UpsertHabitLogRequestDto extends createZodDto(upsertHabitLogRequestSchema) {}

export class TodayQueryDto extends createZodDto(todayQuerySchema) {}
