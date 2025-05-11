import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkInfoEntity } from 'src/module/link/entity/link-info.entity';
import { LinkEntity } from 'src/module/link/entity/link.entity';
import { UserEntity } from 'src/module/user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [UserEntity, LinkEntity, LinkInfoEntity],
          migrations: [`${__dirname}/**/migrations/*{.ts,.js}`],
          synchronize: false,
        };
      },
    }),
  ],
})
export class DbModule {}
