import { createZodDto } from 'nestjs-zod';

import {
  loginRequestSchema,
  registrationRequestSchema,
  updateProfileRequestSchema,
} from '@habit-tracker/contracts';

export class RegistrationRequestDto extends createZodDto(registrationRequestSchema) {}

export class LoginRequestDto extends createZodDto(loginRequestSchema) {}

export class UpdateProfileRequestDto extends createZodDto(updateProfileRequestSchema) {}
