import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MinioService } from './minio.service';
import { UserService } from 'src/module/user/user.service';
import { UserEntity } from 'src/module/user/user.entity';
import { TaskModule } from 'src/module/task/task.module';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([UserEntity]), TaskModule],
  controllers: [],
  providers: [MinioService, UserService],
  exports: [MinioService],
})
export class MinioModule {}
