import { Expose, Transform, Type } from 'class-transformer';
import { IsObject, IsString, MinLength } from 'class-validator';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Language } from '../common/localization';

const getBannerExamples = () => {
  return Object.keys(Language).reduce(
    (acc, key) => {
      const lang = Language[key as keyof typeof Language];
      acc[lang] = { name: 'Name' };
      return acc;
    },
    {} as Record<Language, BannerTranslationDto>,
  );
};

class BannerTranslationDto {
  @Expose()
  @IsString()
  @MinLength(6)
  @ApiProperty()
  readonly name: string;
}

@ApiExtraModels(BannerTranslationDto)
export class CreateBannerDto {
  @ApiProperty()
  link: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  image: Express.Multer.File;

  @IsObject()
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath(BannerTranslationDto),
    },
    example: getBannerExamples(),
  })
  @Transform(({ value }) => JSON.parse(value))
  readonly translations: Record<Language, BannerTranslationDto>;
}

export class BannerDto extends BannerTranslationDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  link: string;

  @Expose()
  @ApiProperty()
  image: string;
}

export class BannersDto {
  @Expose()
  @Type(() => BannerDto)
  @ApiProperty({
    type: BannerDto,
    isArray: true,
  })
  results: BannerDto[];
}
