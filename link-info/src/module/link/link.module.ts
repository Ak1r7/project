import { AuthGuard } from '@core/auth/guard/auth.guard';
import { Module } from '@nestjs/common/decorators';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';

import { LinkInfoEntity } from './entity/link-info.entity';
import { LinkEntity } from './entity/link.entity';
import { LinkController } from './link.controller';
import { LinkService } from './link.service';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([LinkEntity, LinkInfoEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
          },
        };
      },
    }),
  ],
  controllers: [LinkController],
  providers: [LinkService, AuthGuard],
  exports: [LinkService],
})
export class LinkModule {}
