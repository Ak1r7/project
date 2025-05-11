import { createParamDecorator } from '@nestjs/common';

import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const RequestWithUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      return null;
    }
    if (data) {
      request.user = data;
      return request.user;
    }
    return request.user;
  },
);
