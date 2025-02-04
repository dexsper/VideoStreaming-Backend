import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
  SerializeOptions,
} from '@nestjs/common';

import { ApiJwtAuth, CurrentUser } from '../auth/decorators';

import { LikesService } from './likes.service';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { LikeDto } from './like.dto';

@ApiJwtAuth()
@Controller('videos/like')
export class LikesController {
  constructor(private readonly _likesService: LikesService) {}

  @Post()
  @HttpCode(201)
  @SerializeOptions({ type: LikeDto })
  @ApiOperation({ summary: 'Create or update video like' })
  @ApiCreatedResponse({ type: LikeDto })
  @ApiNotFoundResponse({ description: 'Video not found' })
  createOrUpdateLike(
    @Query('videoId', ParseIntPipe) videoId: number,
    @Query('negative', ParseBoolPipe) isNegative: boolean,
    @CurrentUser('id') userId: number,
  ) {
    return this._likesService.createOrUpdateLike(videoId, isNegative, userId);
  }

  @Get(':videoId')
  @SerializeOptions({ type: LikeDto })
  @ApiOperation({ summary: 'Get user like on the video' })
  @ApiOkResponse({ type: LikeDto })
  getLike(
    @Param('videoId', ParseIntPipe) videoId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this._likesService.getVideoLike(videoId, userId);
  }
}
