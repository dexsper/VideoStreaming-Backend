import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
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
} from '@nestjs/swagger';

import { Roles } from '../rbac';
import { ApiJwtAuth, Public } from '../auth/decorators';
import { videoPipe } from '../common/pipes';
import { Language } from '../common/localization';

import { VideosService } from './videos.service';
import { CreateVideoDto, VideoDto, VideosDto } from './video.dto';

@ApiJwtAuth()
@Controller()
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
  findAll(
    @Query('lang') lang: string,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.videosService.getAll(lang, page);
  }

  @Get(':id')
  @Public()
  @SerializeOptions({ type: VideoDto })
  @ApiOperation({ summary: 'Get the specified video' })
  @ApiOkResponse({ type: VideoDto })
  @ApiQuery({
    name: 'lang',
    enum: Language,
  })
  getVideo(@Query('lang') lang: string, @Param('id', ParseIntPipe) id: number) {
    return this.videosService.getById(lang, id);
  }
}
