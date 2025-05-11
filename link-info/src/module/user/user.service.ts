import { AuthRegisterDto } from '@core/auth/dto/auth-register.dto';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { UserDto } from './dto/user.dto';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: AuthRegisterDto): Promise<UserDto> {
    const user = await this.findByEmail(createUserDto.email);

    if (user) {
      Logger.error(`Email:${createUserDto.email} already exists`);
      throw new HttpException(
        'Email is already taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const createdUser = await this.userRepository.save(createUserDto);
    return plainToInstance(UserDto, createdUser);
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    const userFromEmail = await this.userRepository.findOne({
      where: { email },
    });
    return plainToInstance(UserDto, userFromEmail);
  }
}
