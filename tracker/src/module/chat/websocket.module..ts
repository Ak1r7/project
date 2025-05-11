import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { UserService } from '../user/user.service';
import { CodeService } from '../code/code.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from './chat.entity';
import { UserEntity } from '../user/user.entity';
import { FileEntity } from '../code/entity/file.entity';
import { CodeEntity } from '../code/entity/code.entity';
import { RelationEntity } from '../code/entity/relation.entity';
import { AuthService } from 'src/core/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatEntity,
      UserEntity,
      FileEntity,
      CodeEntity,
      RelationEntity,
    ]),
  ],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
    UserService,
    CodeService,
    AuthService,
    JwtService,
  ],
  exports: [ChatService],
})
export class WebsoketsModule {}
