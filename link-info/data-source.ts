import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { LinkInfoEntity } from 'src/module/link/entity/link-info.entity';
import { LinkEntity } from 'src/module/link/entity/link.entity';
import { UserEntity } from 'src/module/user/entity/user.entity';
import { DataSource } from 'typeorm';

import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

dotenv.config();

const configService = new ConfigService();

export const dataSource: PostgresConnectionOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [UserEntity, LinkEntity, LinkInfoEntity],
  migrations: [`${__dirname}/**/migrations/**/*{.ts,.js}`],
  synchronize: false,
};

export const AppDataSource = new DataSource(dataSource);

AppDataSource.initialize()
  .then(() => {
    Logger.log('Data Source has been initialized!');
  })
  .catch(() => {
    Logger.error('Error during Data Source initialization');
  });
