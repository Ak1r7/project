import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from 'src/common/s3/s3.service';
import { MinioService } from 'src/common/minio/minio.service';
import { CodeModule } from '../code/code.module';
import { UserEntity } from './user.entity';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity]),
    CodeModule,
    TaskModule,
  ],
  controllers: [UserController],
  providers: [UserService, S3Service, MinioService],
  exports: [UserService],
})
export class UserModule {}
