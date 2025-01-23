import { Controller, Get, Param, SerializeOptions } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { Roles } from '../rbac';
import { ApiJwtAuth, CurrentUser } from '../auth/decorators';

import { UsersService } from './users.service';
import { UserDto } from './user.dto';

@ApiJwtAuth()
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @SerializeOptions({ type: UserDto })
  @ApiOperation({ summary: 'Get the current authorized user.' })
  @ApiOkResponse({ type: UserDto })
  getMe(@CurrentUser('id') userId: number) {
    return this.usersService.findById(userId);
  }

  @Get(':userId')
  @Roles(['Admin'])
  @SerializeOptions({ type: UserDto })
  @ApiOperation({ summary: 'Get the specified user.' })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse({ description: 'The specified user was not found' })
  getUser(@Param('userId') userId: number) {
    return this.usersService.findById(userId);
  }
}
