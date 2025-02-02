import {
  Body,
  Controller,
  Get,
  HttpCode,
  ParseIntPipe,
  Post,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { Roles } from '../rbac';
import { ApiJwtAuth, Public } from '../auth/decorators';
import { Language } from '../common/localization';

import { CreateTagDto, TagsDto } from './tag.dto';
import { TagsService } from './tags.service';

@ApiJwtAuth()
@Controller()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @HttpCode(201)
  @Roles(['Admin'])
  @ApiOperation({ summary: 'Create new tag' })
  createTag(@Body() createDto: CreateTagDto) {
    return this.tagsService.create(createDto);
  }

  @Get()
  @Public()
  @SerializeOptions({ type: TagsDto })
  @ApiOperation({ summary: 'Get all tags' })
  @ApiOkResponse({ type: TagsDto })
  @ApiQuery({
    name: 'search',
    type: String,
    description: 'A search parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'lang',
    enum: Language,
  })
  getTags(
    @Query('lang') lang: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('search') search?: string,
  ) {
    return this.tagsService.getAll(lang, page, search);
  }
}
