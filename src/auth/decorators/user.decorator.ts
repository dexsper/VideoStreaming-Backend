import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import type { User } from '../interfaces';

interface CurrentUserOptions {
  optional?: boolean;
}

export const CurrentUser = (data: keyof User, params?: CurrentUserOptions) => {
  return createParamDecorator((data: keyof User, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      if (params?.optional) return undefined;
      else throw new UnauthorizedException();
    }

    if (data && !(data in user) && !params?.optional) {
      throw new UnauthorizedException();
    }

    return data ? user[data] : user;
  })(data);
};
