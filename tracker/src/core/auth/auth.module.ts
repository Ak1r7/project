import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/module/user/user.module';
import { GoogleStrategy } from '../strategy/google.strategy';
import { JwtRefreshStrategy } from '../strategy/jwt-refresh.strategy';
import { JwtStrategy } from '../strategy/jwt.strategy';
import googleOauthConfig from '../type/auth/config/google-oauth.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    PassportModule,
    ConfigModule.forFeature(googleOauthConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
