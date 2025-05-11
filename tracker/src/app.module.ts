import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ormconfig } from './ormconfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './module/user/user.module';
import { AuthModule } from './core/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { CodeModule } from './module/code/code.module';
import { WebsoketsModule } from './module/chat/websocket.module.';
import { TaskModule } from './module/task/task.module';
import { MinioModule } from './common/minio/minio.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    TypeOrmModule.forRoot(ormconfig),
    UserModule,
    AuthModule,
    CodeModule,
    WebsoketsModule,
    TaskModule,
    MinioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
