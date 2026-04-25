import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});
