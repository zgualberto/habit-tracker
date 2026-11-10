import { SetMetadata } from '@nestjs/common';

export const PUBLIC_ROUTE_METADATA_KEY = 'isPublicRoute';

export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(PUBLIC_ROUTE_METADATA_KEY, true);
