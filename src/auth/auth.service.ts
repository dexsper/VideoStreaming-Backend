import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/user.dto';
import { hashPassword, verifyPassword } from '../common/crypt';
import { AuthDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(createDto: CreateUserDto): Promise<any> {
    const newUser = await this.usersService.create({
      ...createDto,
      password: await hashPassword(createDto.password),
    });

    return await this.getToken(newUser.id, newUser.email, newUser.roles);
  }

  async signIn(authDto: AuthDto) {
    let user;

    try {
      user = await this.usersService.findByLogin(authDto.login);
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw new BadRequestException('Incorrect login or password.');
      }
    }

    const passwordMatch = await verifyPassword(authDto.password, user.password);
    if (!passwordMatch) {
      throw new BadRequestException('Incorrect login or password.');
    }

    return {
      ...(await this.getToken(user.id, user.email, user.roles)),
      ...user,
    };
  }

  async getToken(userId: number, email: string, roles) {
    return {
      accessToken: await this.jwtService.signAsync({
        sub: userId,
        email,
        roles,
      }),
    };
  }
}
