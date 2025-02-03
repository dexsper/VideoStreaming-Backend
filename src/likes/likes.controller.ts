import {
  Controller,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { ApiJwtAuth, CurrentUser } from '../auth/decorators';

import { LikesService } from './likes.service';
import { ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';

@ApiJwtAuth()
@Controller()
export class LikesController {
  constructor(private readonly _likesService: LikesService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update video like' })
  @ApiNotFoundResponse({ description: 'Video not found' })
  createOrUpdateLike(
    @Query('videoId', ParseIntPipe) videoId: number,
    @Query('negative', ParseBoolPipe) isNegative: boolean,
    @CurrentUser('id') userId: number,
  ) {
    return this._likesService.createOrUpdateLike(videoId, isNegative, userId);
  }
}
