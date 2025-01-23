import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { RbacService } from './rbac.service';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [],
  providers: [
    RbacService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class RbacModule {}
