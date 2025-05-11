import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';
import { CodeEntity } from './entity/code.entity';
import { FileEntity } from './entity/file.entity';
import { UserService } from '../user/user.service';
import { RelationEntity } from './entity/relation.entity';
import { UserEntity } from '../user/user.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      CodeEntity,
      FileEntity,
      UserEntity,
      RelationEntity,
    ]),
  ],
  controllers: [CodeController],
  providers: [CodeService, UserService],
  exports: [CodeService],
})
export class CodeModule {}
