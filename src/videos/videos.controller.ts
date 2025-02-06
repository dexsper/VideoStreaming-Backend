import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Query,
  SerializeOptions,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  PickType,
} from '@nestjs/swagger';

import { Roles } from '../rbac';
import { ApiJwtAuth, CurrentUser, Public } from '../auth/decorators';
import { videoPipe } from '../common/pipes';
import { Language } from '../common/localization';

import { VideosService } from './videos.service';
import {
  CreateVideoDto,
  VideoDetailedDto,
  VideoDto,
  VideosDto,
} from './video.dto';

@ApiJwtAuth()
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @HttpCode(201)
  @Roles(['Admin'])
  @ApiOperation({ summary: 'Create new video' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiNotFoundResponse({ description: 'Model not found' })
  uploadVideo(
    @Body() createDto: CreateVideoDto,
    @UploadedFile(videoPipe()) file: Express.Multer.File,
  ) {
    createDto.file = file;
    return this.videosService.create(createDto);
  }

  @Get()
  @Public()
  @SerializeOptions({ type: VideosDto })
  @ApiOperation({ summary: 'Get all videos' })
  @ApiOkResponse({ type: VideosDto })
  @ApiQuery({
    name: 'lang',
    enum: Language,
  })
  @ApiQuery({
    name: 'search',
    type: String,
    description: 'A search parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'tags',
    type: Number,
    isArray: true,
    description: 'A tags parameter. Optional',
    required: false,
  })
  findAll(
    @Query('lang') lang: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('search') search?: string,
    @Query(
      'tags',
      new ParseArrayPipe({ items: Number, separator: ',', optional: true }),
    )
    tags?: number[],
  ) {
    return this.videosService.getAll(lang, page, search, tags);
  }

  @Get('ids')
  @Public()
  @SerializeOptions({ type: VideoDto })
  @ApiOperation({ summary: 'Get all video ids' })
  @ApiOkResponse({ type: PickType(VideoDto, ['id']), isArray: true })
  getIds() {
    return this.videosService.getIds();
  }

  @Get('favourites')
  @SerializeOptions({ type: VideosDto })
  @ApiOperation({ summary: 'Get all favourites videos' })
  @ApiOkResponse({ type: VideosDto })
  @ApiQuery({
    name: 'lang',
    enum: Language,
  })
  getFavourites(
    @Query('lang') lang: string,
    @Query('page', ParseIntPipe) page: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.videosService.getFavourites(lang, page, userId);
  }

  @Get(':id')
  @Public()
  @SerializeOptions({ type: VideoDetailedDto })
  @ApiOperation({ summary: 'Get the specified video' })
  @ApiOkResponse({ type: VideoDetailedDto })
  @ApiQuery({
    name: 'lang',
    enum: Language,
  })
  getVideo(@Param('id', ParseIntPipe) id: number, @Query('lang') lang: string) {
    return this.videosService.getById(id, lang);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Increment video view by current user' })
  viewVideo(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.videosService.view(id, userId);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Add the specified video to favorites' })
  favourite(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.videosService.toggleFavourite(id, userId);
  }

  @Get(':id/favorite')
  @ApiOperation({ summary: 'Check the specified video is favorite' })
  isFavourite(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.videosService.isFavourite(id, userId);
  }
}
