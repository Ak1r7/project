import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { error } from 'console';
import { UserService } from 'src/module/user/user.service';
import { UserHasdPassword } from '../type/auth/decorators/UserHashPassword';
import { AuthRegisterDto } from '../type/auth/dto/auth-register.dto';
import { CreateUserGmailDto } from '../type/google/createUserGmail.dto';
import { CreateUserDto } from '../type/user/dto/create-user.dto';
import { UserEntity } from 'src/module/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  register(user: AuthRegisterDto): Observable<AuthRegisterDto> {
    return from(
      this.userService.createUser({
        ...user,
      }),
    ).pipe(
      catchError(() => {
        throw new Error('User registration failed');
      }),
    );
  }

  login(
    user: UserHasdPassword,
  ): Observable<{ access_token: string; refresh_token: string }> {
    const payload = { sub: user.id, email: user.email };
    return of({
      access_token: this.jwtService.sign(payload, {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: process.env.REFRESH_EXPIRES_IN,
      }),
    });
  }

  validateUser(
    email: string,
    password: string,
  ): Observable<Omit<UserEntity, 'password' | 'hashPassword'> | null> {
    return this.userService.findByEmail(email).pipe(
      map((user) => {
        if (user && bcrypt.compare(password, user.password)) {
          const { ...result } = user;
          return result;
        }
      }),
      catchError((err) => {
        error('Error validating user:', err);
        return of(null);
      }),
    );
  }

  validateGoogleUser(
    googleUser: CreateUserGmailDto,
  ): Observable<CreateUserDto> {
    return this.userService.findByEmail(googleUser.email).pipe(
      switchMap((user) => {
        if (user) {
          return of(user);
        } else {
          return this.userService.createUserGmail(googleUser);
        }
      }),
    );
  }
}
