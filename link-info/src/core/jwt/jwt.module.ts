import { AuthModule } from '@core/auth/auth.module';
import { Module } from '@nestjs/common';
import { UserModule } from 'src/module/user/user.module';

import { JwtTokenService } from './jwt.service';

@Module({
  imports: [UserModule, AuthModule],
  providers: [JwtTokenService],
  exports: [JwtTokenService],
})
export class JwtTokenModule {}
