import {
  Body,
  Controller, Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  SerializeOptions,
} from '@nestjs/common';

import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { Roles } from '../rbac';
import { ApiJwtAuth, CurrentUser, OptionalAuth } from '../auth/decorators';

import { CommentDto, CommentsDto, CreateCommentDto } from './comment.dto';
import { CommentsService } from './comments.service';

@ApiJwtAuth()
@Controller('videos/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @SerializeOptions({ type: CommentDto })
  @HttpCode(201)
  @Roles(['Admin'])
  @ApiOperation({ summary: 'Create new comment' })
  @ApiCreatedResponse({ type: CommentDto })
  @ApiNotFoundResponse({ description: 'Video not found' })
  createComment(
    @Body() createDto: CreateCommentDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.commentsService.create(createDto, userId);
  }

  @Get()
  @OptionalAuth()
  @SerializeOptions({ type: CommentsDto })
  @ApiOperation({ summary: 'Get all video comments' })
  @ApiOkResponse({ type: CommentsDto })
  getComments(
    @Query('videoId') videoId: number,
    @Query('page') page: number,
    @CurrentUser('id', { optional: true }) userId?: number,
  ) {
    return this.commentsService.getVideoComments(videoId, page, userId);
  }

  @Get('unproven')
  @Roles(['Admin'])
  @SerializeOptions({ type: CommentsDto })
  @ApiOperation({ summary: 'Get all unproven comments' })
  @ApiOkResponse({ type: CommentsDto })
  getUnprovenComments(@Query('page', ParseIntPipe) page: number) {
    return this.commentsService.getUnproven(page);
  }

  @Post(':commentId/approve')
  @Roles(['Admin'])
  @SerializeOptions({ type: CommentDto })
  @ApiOperation({ summary: 'Approve the specified comment' })
  @ApiOkResponse({ type: CommentDto })
  approveComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentsService.approve(commentId);
  }

  @Delete(":commentId")
  @Roles(['Admin'])
  @ApiOperation({ summary: 'Delete the specified comment' })
  deleteComment(@Param('commentId', ParseIntPipe) commentId: number){
    return this.commentsService.delete(commentId);
  }
}
