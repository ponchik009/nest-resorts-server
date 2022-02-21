import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './entities/user.entity';
import UpdateUserDto from './dto/update-user.dto';
import CreateUserDto from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne(
      {
        email,
      },
      { relations: ['likes'] },
    );

    return user;
  }

  async getByUsername(username: string) {
    const user = await this.usersRepository.findOne(
      { username },
      { relations: ['likes'] },
    );
    if (user) {
      return user;
    }

    throw new HttpException(
      'User with this username does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getById(id: number) {
    const user = await this.usersRepository.findOne(
      { id },
      { relations: ['likes'] },
    );
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async create(dto: CreateUserDto) {
    const newUser = this.usersRepository.create(dto);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async update(id: number, dto: UpdateUserDto) {
    const newUser = this.usersRepository.create({
      id: Number(id),
      ...dto,
    });
    await this.usersRepository.save(newUser);
    return newUser;
  }
}
