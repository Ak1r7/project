import {
  Post,
  Body,
  Controller,
  BadRequestException,
  Get,
  UseGuards,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { catchError, EMPTY, map, Observable, of, switchMap } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { UserService } from 'src/module/user/user.service';
import { GoogleAuthGuard } from '../guards/google-auth/google-auth.guard';
import { AuthLoginDto } from '../type/auth/dto/auth-login.dto';
import { AuthRegisterDto } from '../type/auth/dto/auth-register.dto';
import { User } from '../type/user/decorators/user.decorator';
import { UserResponsInterface } from '../type/user/interface/user.interface';
import { AuthService } from './auth.service';
import { UserEntity } from 'src/module/user/user.entity';

@ApiBearerAuth()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @ApiBody({ type: AuthRegisterDto })
  register(@Body() authRegisterDto: AuthRegisterDto) {
    return this.authService.register(authRegisterDto).pipe(
      map((user: UserEntity) => this.userService.buildUserResponse(user)),
      catchError((error) => {
        throw new BadRequestException(error.message);
      }),
    );
  }

  @Post('login')
  @ApiBody({ type: AuthLoginDto })
  login(
    @Body() authLogin: AuthLoginDto,
  ): Observable<{ access_token: string; refresh_token: string }> {
    return this.authService
      .validateUser(authLogin.email, authLogin.password)
      .pipe(
        switchMap((user) => {
          if (!user) {
            throw new UnauthorizedException();
          }
          return this.authService.login(user);
        }),
      );
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  currentUser(@User() user: UserEntity): Observable<UserResponsInterface> {
    const users = this.userService.buildUserResponse(user);
    return of(users);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  googleCallback(@Req() req: Request, @Res() res: Response): Observable<void> {
    const users = req.user as Omit<UserEntity, 'password' | 'hashPassword'>;
    return this.authService.login(users).pipe(
      map((response) => {
        const url = `http://localhost:5173?token=${response.access_token}&refreshtoken=${response.refresh_token}`;
        res.redirect(url);
      }),
      catchError(() => {
        res.status(500).send('Internal Server Error');
        return EMPTY;
      }),
    );
  }
}
