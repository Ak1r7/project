import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ormconfig } from './ormconfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './app/user/user.module'
import { LinkModule } from './app/link/link.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [TypeOrmModule.forRoot(ormconfig),UserModule,LinkModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
