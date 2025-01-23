import {
  Request,
  Body,
  Controller,
  Post,
  SerializeOptions,
  HttpCode,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { CreateUserDto } from '../users/user.dto';
import { AuthDto, AuthResponseDto } from './auth.dto';
import { AuthService } from './auth.service';

import { ApiJwtAuth, Public } from './decorators';

@ApiJwtAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @Public()
  @SerializeOptions({ type: AuthResponseDto })
  @ApiOperation({ summary: 'Create new user' })
  @ApiCreatedResponse({
    type: AuthResponseDto,
    description: 'User successfully created.',
  })
  @ApiConflictResponse({ description: 'Login or email already in use.' })
  signup(@Body() createDto: CreateUserDto) {
    return this.authService.signUp(createDto);
  }

  @Post('signin')
  @Public()
  @SerializeOptions({ type: AuthResponseDto })
  @ApiOperation({ summary: 'Sign in user and return authentication token.' })
  @ApiOkResponse({
    type: AuthResponseDto,
    description: 'User successfully signed.',
  })
  @ApiBadRequestResponse({ description: 'Incorrect login or password.' })
  signIn(@Body() authDto: AuthDto) {
    return this.authService.signIn(authDto);
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Logout the current user.' })
  @ApiNoContentResponse({ description: 'Successfully logged out.' })
  logout(@Request() req) {
    return req.logout();
  }
}
