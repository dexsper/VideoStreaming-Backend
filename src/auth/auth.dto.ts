import { ApiProperty } from '@nestjs/swagger';

import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Expose } from 'class-transformer';
import { UserDto } from '../users/user.dto';

export class AuthDto {
  @IsString()
  @MaxLength(30)
  @ApiProperty({ example: 'new_user' })
  readonly login: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/, {
    message: 'Contain at least one letter, number and special character',
  })
  @ApiProperty({ example: 'Ex@mple123!' })
  readonly password: string;
}

export class AuthResponseDto extends UserDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: 'Jason Web Token (JWT) for an authenticated user.',
    example: 'eyJhbGci...',
  })
  accessToken: string;
}
