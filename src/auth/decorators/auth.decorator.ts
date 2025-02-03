import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { applyDecorators, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const IS_OPTIONAL_KEY = 'isOptional';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_KEY, true);

export function ApiJwtAuth() {
  return function (target: any) {
    const methods = Object.getOwnPropertyNames(target.prototype);

    methods.forEach((method) => {
      if (
        method !== 'constructor' &&
        !Reflect.getMetadata('isPublic', target.prototype[method])
      ) {
        applyDecorators(
          ApiBearerAuth('jwt-auth'),
          ApiUnauthorizedResponse({
            description: 'The user is not logged in.',
          }),
        )(target.prototype[method]);
      }
    });
  };
}
