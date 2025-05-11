import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../app/user/user.module'; 

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: 'reflink', 
      signOptions: { expiresIn: '60s' }, 
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}