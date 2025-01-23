import { Injectable } from '@nestjs/common';

import { UserRole } from '../users/user.entity';

@Injectable()
export class RbacService {
  constructor() {}

  async authorize(request: any, requestedGeneralRoles: UserRole[]) {
    const user = request.user;

    if (!user) {
      return false;
    }

    return requestedGeneralRoles.some((role) => user.roles.includes(role));
  }
}
