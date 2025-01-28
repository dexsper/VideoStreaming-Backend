import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

import { IsObject, IsString, MinLength } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';

import { Language } from '../common/localization';
import { IPagination } from '../common/paginate';

const getModelExamples = () => {
  return Object.keys(Language).reduce(
    (acc, key) => {
      const lang = Language[key as keyof typeof Language];
      acc[lang] = { name: 'Name' };
      return acc;
    },
    {} as Record<Language, ModelTranslationDto>,
  );
};

class ModelTranslationDto {
  @Expose()
  @IsString()
  @MinLength(6)
  @ApiProperty()
  readonly name: string;
}

@ApiExtraModels(ModelTranslationDto)
export class CreateModelDto {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  image: Express.Multer.File;

  @IsObject()
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath(ModelTranslationDto),
    },
    example: getModelExamples(),
  })
  @Transform(({ value }) => JSON.parse(value))
  readonly translations: Record<Language, ModelTranslationDto>;
}

export class ModelDto extends ModelTranslationDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  image: string;
}

export class ModelsDto implements IPagination<ModelDto> {
  @Expose()
  @Type(() => ModelDto)
  @ApiProperty({
    type: ModelDto,
    isArray: true,
  })
  results: ModelDto[];

  @Expose()
  @ApiProperty()
  page_total: number;

  @Expose()
  @ApiProperty()
  total: number;
}
