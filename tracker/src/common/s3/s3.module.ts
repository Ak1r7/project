import { Module } from '@nestjs/common';
import { UserEntity } from 'src/module/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserService } from 'src/module/user/user.service';
import { S3Service } from './s3.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([UserEntity])],
  controllers: [],
  providers: [S3Service, UserService],
  exports: [S3Service],
})
export class S3Module {}
