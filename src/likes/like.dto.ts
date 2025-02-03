import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LikeDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  isNegative: boolean;
}
