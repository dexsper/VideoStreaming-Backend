import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

import { IsNumber, IsObject, IsString, MinLength } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';

import { Language } from '../common/localization';
import { IPagination } from '../common/paginate';

import { ModelDto } from '../models/models.dto';

const getVideoExamples = () => {
  return Object.keys(Language).reduce(
    (acc, key) => {
      const lang = Language[key as keyof typeof Language];
      acc[lang] = { name: 'Name', description: 'Description' };
      return acc;
    },
    {} as Record<Language, VideoTranslationDto>,
  );
};

class VideoTranslationDto {
  @Expose()
  @IsString()
  @MinLength(6)
  @ApiProperty()
  readonly name: string;

  @Expose()
  @IsString()
  @MinLength(6)
  @ApiProperty()
  readonly description: string;
}

export class CreateVideoDto {
  @IsNumber()
  @ApiProperty()
  @Type(() => Number)
  readonly modelId: number;

  @IsObject()
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath(VideoTranslationDto),
    },
    example: getVideoExamples(),
  })
  @Transform(({ value }) => JSON.parse(value))
  readonly translations: Record<Language, VideoTranslationDto>;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: Express.Multer.File;
}

export class VideoDto extends VideoTranslationDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  length: number;

  @Expose()
  @ApiProperty()
  playlist_file: string;

  @Expose()
  @ApiProperty()
  model: ModelDto;
}

export class VideosDto implements IPagination<VideoDto> {
  @Expose()
  @Type(() => VideoDto)
  @ApiProperty({
    type: VideoDto,
    isArray: true,
  })
  results: VideoDto[];

  @Expose()
  @ApiProperty()
  page_total: number;

  @Expose()
  @ApiProperty()
  total: number;
}
