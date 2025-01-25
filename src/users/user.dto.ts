import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(30)
  @ApiProperty({ example: 'new_user' })
  readonly login: string;

  @IsEmail()
  @MaxLength(320)
  @ApiProperty({ example: 'user@example.com' })
  readonly email: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/, {
    message: 'Contain at least one letter, number and special character',
  })
  @ApiProperty({ example: 'Ex@mple123!' })
  readonly password: string;
}

export class UserDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty({ example: 'user@example.com' })
  email: string;
}
