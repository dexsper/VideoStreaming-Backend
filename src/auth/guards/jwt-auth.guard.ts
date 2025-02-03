import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY, IS_OPTIONAL_KEY } from '../decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context, status) {
    const isOptional = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (err || (!user && !isOptional)) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
