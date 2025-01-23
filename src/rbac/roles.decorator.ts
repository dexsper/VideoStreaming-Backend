import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger';

import { UserRole } from '../users/user.entity';

export function Roles(globalRoles?: (keyof typeof UserRole)[]) {
  if (!globalRoles?.length) {
    return () => {};
  }

  const globalRolesValues = globalRoles
    ? globalRoles.map((role) => UserRole[role])
    : [];

  return applyDecorators(
    SetMetadata('roles', globalRolesValues),
    ApiForbiddenResponse({ description: 'Forbidden resource' }),
  );
}
