import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
import { ConfigModule } from '@nestjs/config';
import { CodeModule } from '../code/code.module';
import { RelationTaskEntity } from './relation.entity';
import { MinioService } from 'src/common/minio/minio.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([TaskEntity, UserEntity, RelationTaskEntity]),
    CodeModule,
  ],
  controllers: [TaskController],
  providers: [TaskService, UserService, MinioService],
  exports: [TaskService],
})
export class TaskModule {}
