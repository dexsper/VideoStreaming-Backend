import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

import { Roles } from '../rbac';
import { ApiJwtAuth, Public } from '../auth/decorators';
import { Language } from '../common/localization';

import { CreateTagDto, TagDto, TagsDto } from './tag.dto';
import { TagsService } from './tags.service';

@ApiJwtAuth()
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @HttpCode(201)
  @Roles(['Admin'])
  @SerializeOptions({ type: TagDto })
  @ApiOperation({ summary: 'Create new tag' })
  @ApiCreatedResponse({ type: TagDto })
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
  getTags(@Query('lang') lang: string, @Query('search') search?: string) {
    return this.tagsService.getAll(lang, search);
  }

  @Get('popular')
  @Public()
  @SerializeOptions({ type: TagsDto })
  @ApiOperation({ summary: 'Get popular tags' })
  @ApiOkResponse({ type: TagsDto })
  @ApiQuery({
    name: 'lang',
    enum: Language,
  })
  getPopularTags(@Query('lang') lang: string) {
    return this.tagsService.getPopular(lang);
  }
}
