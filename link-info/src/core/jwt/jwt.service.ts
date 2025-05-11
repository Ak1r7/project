import { ValidDto } from '@core/auth/dto/valid.dto';
import { TokenResponseDto } from '@core/jwt/dto/token.dto';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { sign } from 'jsonwebtoken';

@Injectable()
export class JwtTokenService {
  constructor(private readonly configService: ConfigService) {}

  generateTokens(user: ValidDto): TokenResponseDto {
    const secretAccess = this.configService.get<string>('ACCESS_TOKEN_SECRET');
    const secretRefresh = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );

    if (!secretAccess || !secretRefresh) {
      Logger.error(
        `Missing secret for token. Expected environment variable: ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET`,
      );

      throw new HttpException(
        `Missing secret for token.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const tokenAccess = sign(user, secretAccess, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });

    const tokenRefresh = sign(user, secretAccess, {
      expiresIn: this.configService.get<string>('REFRESH_EXPIRES_IN'),
    });

    const token = {
      access_token: tokenAccess,
      refresh_token: tokenRefresh,
    };

    return plainToInstance(TokenResponseDto, token);
  }
}
