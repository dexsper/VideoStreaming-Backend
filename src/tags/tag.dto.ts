import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

import { Expose, Type } from 'class-transformer';
import { IsObject, IsString, MinLength } from 'class-validator';

import { Language } from '../common/localization';
import { IPagination } from '../common/paginate';

const getTagExamples = () => {
  return Object.keys(Language).reduce(
    (acc, key) => {
      const lang = Language[key as keyof typeof Language];
      acc[lang] = { text: 'Tag' };
      return acc;
    },
    {} as Record<Language, TagTranslationDto>,
  );
};

class TagTranslationDto {
  @Expose()
  @IsString()
  @MinLength(6)
  @ApiProperty()
  readonly text: string;
}

@ApiExtraModels(TagTranslationDto)
export class CreateTagDto {
  @IsObject()
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath(TagTranslationDto),
    },
    example: getTagExamples(),
  })
  readonly translations: Record<Language, TagTranslationDto>;
}

export class TagDto extends TagTranslationDto {
  @Expose()
  @ApiProperty()
  id: number;
}

export class TagsDto implements IPagination<TagDto> {
  @Expose()
  @Type(() => TagDto)
  @ApiProperty({
    type: TagDto,
    isArray: true,
  })
  results: TagDto[];

  @Expose()
  @ApiProperty()
  page_total: number;

  @Expose()
  @ApiProperty()
  total: number;
}
