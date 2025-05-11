import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { sign } from 'jsonwebtoken';
import { error } from 'console';
import { AuthRegisterDto } from 'src/core/type/auth/dto/auth-register.dto';
import { CreateUserGmailDto } from 'src/core/type/google/createUserGmail.dto';
import { UpdateUserDto } from 'src/core/type/user/dto/update-user.dto';
import { UserResponsInterface } from 'src/core/type/user/interface/user.interface';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  findByEmail(email: string): Observable<UserEntity> {
    return from(this.userRepository.findOne({ where: { email } }));
  }

  createUser(createUserDto: AuthRegisterDto): Observable<AuthRegisterDto> {
    return from(
      this.userRepository.findOne({ where: { email: createUserDto.email } }),
    ).pipe(
      switchMap((existingUser) => {
        if (existingUser) {
          throw new HttpException(
            'Email is already taken',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
        const newUser = this.userRepository.create(createUserDto);
        return from(this.userRepository.save(newUser));
      }),
      catchError((err) => {
        error('Error create user:', err);
        return of(null);
      }),
    );
  }

  createUserGmail(createUserDto: CreateUserGmailDto) {
    return from(
      this.userRepository.findOne({
        where: { email: createUserDto.email },
      }),
    ).pipe(
      switchMap((existingUser) => {
        if (existingUser) {
          throw new HttpException(
            'Email is already taken',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
        const newUser = this.userRepository.create(createUserDto);
        newUser.password = '';
        return from(this.userRepository.save(newUser));
      }),
      catchError((err) => {
        error('Error create user:', err);
        return of(null);
      }),
    );
  }

  findById(id: string): Observable<UserEntity> {
    return from(
      this.userRepository.findOne({
        where: { id },
      }),
    ).pipe(map((user) => user));
  }

  updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Observable<UserEntity> {
    return this.findById(userId).pipe(
      switchMap((users) => {
        Object.assign(users, updateUserDto);
        return from(this.userRepository.save(users));
      }),
    );
  }

  updateAvatars(userId: string, avatarUrl: string): Observable<UserEntity> {
    return this.findById(userId).pipe(
      switchMap((user) => {
        user.avatarUrl = avatarUrl;
        return from(this.userRepository.save(user));
      }),
    );
  }

  connectUser(id: string, socket: string): Observable<UserEntity> {
    return from(this.userRepository.findOne({ where: { id } })).pipe(
      switchMap((user) => {
        if (!user) {
          console.error('User not found');
          throw new Error('User not found');
        }
        user.socketId = socket;
        user.activiteAt = null;
        return from(this.userRepository.save(user));
      }),
      catchError((error) => {
        console.error('Error during connection:', error);
        throw error;
      }),
    );
  }

  disconnectUser(id: string): Observable<UserEntity> {
    return from(this.userRepository.findOne({ where: { id } })).pipe(
      switchMap((user) => {
        if (!user) {
          console.error('User not found');
          throw new Error('User not found');
        }
        user.socketId = null;
        user.activiteAt = new Date();
        return from(this.userRepository.save(user));
      }),
      catchError((error) => {
        console.error('Error during connection:', error);
        throw error;
      }),
    );
  }

  generateToken(user: UserEntity, type: 'access' | 'refresh'): string {
    const secret =
      type === 'access'
        ? process.env.ACCESS_TOKEN_SECRET
        : process.env.REFRESH_TOKEN_SECRET;

    return sign(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      secret,
    );
  }

  buildUserResponse(user: UserEntity): UserResponsInterface {
    return {
      user: {
        ...user,
        token: this.generateToken(user, 'access'),
        refreshToken: this.generateToken(user, 'refresh'),
      },
    };
  }
}
