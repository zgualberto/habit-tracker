import { SetMetadata } from '@nestjs/common';

export const OPTIONAL_AUTHENTICATION_METADATA_KEY = 'isAuthenticationOptional';

export const OptionalAuthentication = (): MethodDecorator & ClassDecorator =>
  SetMetadata(OPTIONAL_AUTHENTICATION_METADATA_KEY, true);
