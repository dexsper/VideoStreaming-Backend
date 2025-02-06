import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './user.entity';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(createDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.usersRepository.findOne({
      where: [{ login: createDto.login }, { email: createDto.email }],
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this login or email already exists',
      );
    }

    const newUser = this.usersRepository.create({
      ...createDto,
    });

    return await this.usersRepository.save(newUser);
  }

  async getById(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByLogin(login: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ login });
    if (!user) {
      throw new NotFoundException(`User with login ${login} not found`);
    }
    return user;
  }
}
