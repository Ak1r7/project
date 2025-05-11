import { AuthLoginDto } from '@core/auth/dto/auth-login.dto';
import { TokenResponseDto } from '@core/jwt/dto/token.dto';
import { JwtTokenService } from '@core/jwt/jwt.service';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserService } from 'src/module/user/user.service';

import { AuthRegisterDto } from './dto/auth-register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async register(userInfo: AuthRegisterDto): Promise<TokenResponseDto> {
    const hashedPassword = await bcrypt.hash(userInfo.password, 10);

    const userRegistered = await this.userService.createUser({
      ...userInfo,
      password: hashedPassword,
    });

    const token = this.jwtTokenService.generateTokens({
      id: userRegistered.id,
      email: userRegistered.email,
    });

    return plainToInstance(TokenResponseDto, token);
  }

  async login(userInfo: AuthLoginDto): Promise<TokenResponseDto> {
    const user = await this.userService.findByEmail(userInfo.email);
    if (!user) {
      Logger.error(`User with email ${userInfo.email} not found`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const isPasswordValid = await bcrypt.compare(
      userInfo.password,
      user.password,
    );
    if (!isPasswordValid) {
      Logger.warn(
        `Validation failed: Invalid password for email ${userInfo.email}`,
      );
      throw new HttpException('Incorrect password', HttpStatus.BAD_REQUEST);
    }
    delete (user as { password?: string }).password;
    const token = this.jwtTokenService.generateTokens({
      id: user.id,
      email: user.email,
    });

    return plainToInstance(TokenResponseDto, token);
  }
}
