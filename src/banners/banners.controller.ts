import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  SerializeOptions,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { Roles } from '../rbac';
import { ApiJwtAuth, Public } from '../auth/decorators';
import { imagePipe } from '../common/pipes';
import { Language } from '../common/localization';

import { BannersService } from './banners.service';
import { BannerDto, BannersDto, CreateBannerDto } from './banner.dto';

@ApiJwtAuth()
@Controller('banners')
export class BannersController {
  constructor(private readonly _bannersService: BannersService) {}

  @Post()
  @HttpCode(201)
  @Roles(['Admin'])
  @ApiOperation({ summary: 'Create new banner' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  createModel(
    @Body() createDto: CreateBannerDto,
    @UploadedFile(imagePipe()) image: Express.Multer.File,
  ) {
    createDto.image = image;
    return this._bannersService.create(createDto);
  }

  @Get()
  @Public()
  @SerializeOptions({ type: BannersDto })
  @ApiOperation({ summary: 'Get all banners' })
  @ApiOkResponse({ type: BannersDto })
  @ApiQuery({
    name: 'lang',
    enum: Language,
  })
  getBanners(@Query('lang') lang: string) {
    return this._bannersService.getAll(lang);
  }
}
