import {
  Body,
  Controller,
  Get,
  HttpCode,
  ParseIntPipe,
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

import { ModelsService } from './models.service';
import { CreateModelDto, ModelsDto } from './models.dto';

@ApiJwtAuth()
@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post()
  @HttpCode(201)
  @Roles(['Admin'])
  @ApiOperation({ summary: 'Create new model' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  createModel(
    @Body() createDto: CreateModelDto,
    @UploadedFile(imagePipe()) image: Express.Multer.File,
  ) {
    createDto.image = image;
    return this.modelsService.create(createDto);
  }

  @Get()
  @Public()
  @SerializeOptions({ type: ModelsDto })
  @ApiOperation({ summary: 'Get all models' })
  @ApiOkResponse({ type: ModelsDto })
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
  getModels(
    @Query('lang') lang: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('search') search?: string,
  ) {
    return this.modelsService.getAll(lang, page, search);
  }
}
