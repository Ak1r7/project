import { AuthLoginDto } from '@core/auth/dto/auth-login.dto';
import { AuthRegisterDto } from '@core/auth/dto/auth-register.dto';
import { TokenResponseDto } from '@core/jwt/dto/token.dto';
import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';

@ApiBearerAuth()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-user')
  @ApiOperation({ summary: 'User register' })
  @ApiCreatedResponse({
    description: 'Created Succesfully',
    type: TokenResponseDto,
    isArray: false,
  })
  @ApiBody({ type: AuthRegisterDto })
  async register(
    @Body() authRegisterDto: AuthRegisterDto,
  ): Promise<TokenResponseDto> {
    return this.authService.register(authRegisterDto);
  }

  @Post('user-login')
  @ApiOperation({ summary: 'User login' })
  @ApiCreatedResponse({
    description: 'Login Succesfully',
    type: TokenResponseDto,
    isArray: false,
  })
  @ApiBody({ type: AuthLoginDto })
  async login(@Body() authLogin: AuthLoginDto): Promise<TokenResponseDto> {
    return this.authService.login(authLogin);
  }
}
