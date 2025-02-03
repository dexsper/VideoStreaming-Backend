import { ApiProperty } from '@nestjs/swagger';

import { IsNumber, IsString } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';

import { IPagination } from '../common/pagination';

export class CreateCommentDto {
  @Expose()
  @IsString()
  @ApiProperty()
  text: string;

  @Expose()
  @IsNumber()
  @ApiProperty()
  videoId: number;
}

export class CommentDto extends CreateCommentDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  @Transform(({ obj }) => obj.user.login)
  author: string;
}

export class CommentsDto implements IPagination<CommentDto> {
  @Expose()
  @Type(() => CommentDto)
  @ApiProperty({
    type: CommentDto,
    isArray: true,
  })
  results: CommentDto[];

  @Expose()
  @ApiProperty()
  hasNextPage: boolean;
}
